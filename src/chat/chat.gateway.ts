import { UseGuards, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '@utils/prisma/prisma.service';
import { ChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { LeaveGroupDto } from './dto/leave-group.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import * as nodemailer from 'nodemailer';
import { SocketGuard } from '@utils/common/guards/socket-auth.gaurd';
import { AuthenticatedSocket } from './types/socket-user';
import { JwtService } from 'src/jwt-service/jwt-service.service';
import { socketAuthMiddleware } from '@utils/common/middleware/socket-middleware/socket.middleware';
import { GetMessagesDto } from './dto/get-message.dto';
import {
  ApiAddGroupMember,
  ApiEditMessage,
  ApiGetMessages,
  ApiJoinRoom,
  ApiLeaveGroup,
  ApiSendMessage,
} from './docs/api-docs.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/user/users.service';

@ApiTags('Chat-WebSocket')
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  afterInit(server: Server) {
    server.use(socketAuthMiddleware(this.jwtService));
  }
  handleConnection(client: AuthenticatedSocket) {
    console.log('User connected:', client.data.user?.sub);
  }

  // Initiate Chat event to Create chat
  @UseGuards(SocketGuard)
  @SubscribeMessage('initiateChat')
  async handleInitiateChat(
    @MessageBody(ValidationPipe) data: ChatDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      let chatData;
      const user = client.data.user;
      const sub = user?.sub; //User Id stored with socket <-- coming from socket guard
      if (!sub) {
        client.emit('error', { message: 'Unauthorized: Missing user ID' });
        return;
      }

      data.created_by = sub;
      let membersToAdd: string[] = [];
      let recieverName: string | null = null;
      if (!data.created_by) {
        client.emit('error', { message: 'Unauthorized: Missing user ID' });
        return;
      }

      if (data.members && data.members.length > 0) {
        const allMembers = [data.created_by, ...data.members];

        //check for Group name in message body if not get it from DB for all the members in array except creator and assign to group name

        if (!data.name) {
          const searchUsers = await this.userService.getUsersName(allMembers);

          const usersName = searchUsers.map((userName) => {
            const metadata = userName;
            return metadata ?? 'Unnamed';
          });
          console.log(usersName);
          chatData = {
            name: usersName.join(','),
            created_by: data.created_by,
            members: allMembers,
          };
          membersToAdd = allMembers;
        } else {
          chatData = {
            name: data.name,
            created_by: data.created_by,
            members: allMembers,
          };
          membersToAdd = allMembers;
        }
      } else if (data.receiver_id) {
        const allMembers = [data.created_by, data.receiver_id];

        // Finding Existing if an existing 1:1 chat exists

        const chatExists = await this.userService.findChatBetweenMembers(allMembers);
        if (chatExists) {
          client.emit('error', {
            message: `Chat already exist between ${data.created_by} and ${data.receiver_id}`,
          });
          return;
        }
        const reciever = await this.prisma.user.findUnique({
          where: { id: data.receiver_id },
          select: { full_name: true },
        });
        const metadata = reciever?.full_name as { fullName?: string } | undefined;
        recieverName = metadata?.fullName ?? 'Unamed';

        chatData = {
          name: data.name || null,
          receiver_id: data.receiver_id,
          created_by: data.created_by,
          members: allMembers,
        };
        membersToAdd = allMembers;
      } else {
        client.emit('error', { message: 'Member or reciever id is must' });
        return;
      }
      if (!chatData) {
        throw new Error('chatData is undefined.');
      }
      const createdChat = await this.prisma.chat.create({
        data: chatData,
      });

      const addMembers = membersToAdd.map((userId) =>
        this.prisma.group_members.create({
          data: {
            chat_id: createdChat.id,
            user_id: userId,
          },
        }),
      );
      await Promise.all(addMembers);

      const room = `chat_${createdChat.id}`;
      await client.join(room);
      client.emit('chatCreated', { chat: createdChat, room });
      if (membersToAdd.length > 1) {
        client.to(room).emit('joinChatRoom', {
          chat: createdChat,
          room: room,
          members: membersToAdd,
          recieverName: recieverName || null,
        });
      }
    } catch (error) {
      console.error('Error Creating chat', error);
      this.server.emit('error', { message: 'Failed to create chat' });
    }
  }

  @UseGuards(SocketGuard)
  @ApiSendMessage()
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody(ValidationPipe) data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.sender_id = sub;
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chat_id },
      include: {
        group_members: {
          select: {
            user_id: true,
          },
        },
      },
    });
    if (!chat) {
      client.emit('error', { message: `No such chat with chatId: ${data.chat_id} exists` });
      return;
    }
    const memberIds = chat.group_members.map((member) => member.user_id);

    if (!memberIds.includes(data.sender_id)) {
      client.emit('error', { message: 'You are not member of this group' });
      return;
    }
    const room = `chat_${data.chat_id}`;
    const isInRoom = client.rooms.has(room);
    if (!isInRoom) {
      await client.join(`chat_${room}`);
    }

    const sendMessage = await this.prisma.message.create({
      data: {
        chat_id: data.chat_id,
        content: data.content,
        sender_id: data.sender_id,
        receiver_id: null,
        is_seen: false,
      },
    });

    client.to(room).emit('message', sendMessage);
  }

  @UseGuards(SocketGuard)
  @ApiJoinRoom()
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody(ValidationPipe) data: JoinRoomDto,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.user_id = sub;
    const chats = (await this.prisma.group_members.findMany({
      where: {
        user_id: data.user_id,
      },
      select: { chat_id: true },
    })) as { chat_id: string }[];
    const chatIds = chats.map((chat) => chat.chat_id);
    try {
      for (const chatId of chatIds) {
        await client.join(`chat_${chatId}`);
        console.log(`You joined chat ${chatId}`);
      }
    } catch (error) {
      console.error('Join room error', error);
      throw new Error('Connection to chats failed');
    }

    client.emit('joinedRoom', { rooms: chatIds });
  }

  @UseGuards(SocketGuard)
  @ApiGetMessages()
  @SubscribeMessage('getMessages')
  async handleGetPrivateMessage(
    @MessageBody() data: GetMessagesDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.user_id = sub;
    const chats = await this.prisma.chat.findMany({
      where: {
        group_members: {
          some: {
            user_id: data.user_id,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      include: {
        messages: {
          orderBy: [{ is_seen: 'asc' }, { updated_at: 'asc' }],
        },
      },
    });

    const chatMessages = chats.map((chat) => ({
      chatId: chat.id,
      messages: chat.messages,
    }));
    console.log(chatMessages);
    const messageIds = chatMessages.flatMap((chat) => chat.messages.map((message) => message.id));
    console.log(chatMessages);
    if (messageIds.length > 0) {
      await this.prisma.message.updateMany({
        where: {
          id: { in: messageIds },
        },
        data: { is_seen: true },
      });
    }

    client.emit('message', { chatMessages });
  }

  @UseGuards(SocketGuard)
  @ApiEditMessage()
  @SubscribeMessage('editMessages')
  async handleEditMessage(
    @MessageBody(ValidationPipe) data: EditMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.sender_id = sub;

    const message = await this.prisma.message.findUnique({
      where: { id: data.message_id },
    });
    if (!message) {
      client.emit('error', `Message of id ${message} not found`);
      return;
    }

    if (message.sender_id === data.sender_id) {
      const editMessage = await this.prisma.message.update({
        where: {
          id: data.message_id,
        },
        data: {
          content: data.content,
          sender_id: data.sender_id,
          is_seen: false,
          updated_at: new Date(),
        },
      });
      await this.prisma.chat.update({
        where: { id: editMessage.chat_id ?? undefined },
        data: { updated_at: new Date() },
      });
      client.emit('messageEdited', { editMessage });
    } else {
      client.emit('error', 'you cna not edit the message');
      return;
    }
  }

  @UseGuards(SocketGuard)
  @ApiAddGroupMember()
  @SubscribeMessage('addMember')
  async handleAddMember(
    @MessageBody(ValidationPipe) data: AddGroupMemberDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.user_id = sub;
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.user_id },
    });

    if (!userExists) {
      client.emit('error', { message: 'User not found' });
      return;
    }

    const groupExists = await this.prisma.chat.findUnique({
      where: { id: data.chat_id },
      include: {
        group_members: {
          select: { user_id: true, user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!groupExists) {
      client.emit('error', { message: 'Group not found' });
      return;
    }

    const memberExists = groupExists.group_members.some(
      (member) => member.user_id === data.user_id,
    );

    if (memberExists) {
      client.emit('error', {
        message: `User with id ${data.user_id} is already a member of this group.`,
      });
      return;
    }

    const addMember = [...groupExists.members, data.user_id];
    await this.prisma.chat.update({
      where: { id: data.chat_id },
      data: { members: addMember },
    });
    await this.prisma.group_members.create({
      data: {
        chat_id: data.chat_id,
        user_id: data.user_id,
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '231asadullah@gmail.com',
        pass: 'yjrx whlb ftec emyo',
      },
    });
    const updateGroupMembers = groupExists.group_members
      .filter((member) => member.user.id !== data.user_id && member.user.id !== data.created_by)
      .map((member) => member.user.email);
    for (const email of updateGroupMembers) {
      try {
        const mailOption = {
          from: '231asadullah@gmail',
          to: email,
          subject: 'New Member added to Group',
          text: `User with ${data.user_id} has been added to Group`,
        };
        await transporter.sendMail(mailOption);
      } catch (error) {
        console.log('Error sending email to', email, error);
      }
    }
    try {
      await transporter.sendMail({
        from: '231asadullah@gmail.com',
        to: userExists.email,
        subject: 'You were added to a group',
        text: `You've been added to the group "${groupExists.name}".`,
      });
    } catch (err) {
      console.error('Error sending email to new user', userExists.email, err);
    }

    client.emit('memberAdded', {
      message: 'User successfully added to the group.',
      updateGroupMembers: updateGroupMembers,
    });
  }

  @UseGuards(SocketGuard)
  @ApiLeaveGroup()
  @SubscribeMessage('leaveGroup')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody(ValidationPipe) data: LeaveGroupDto,
  ) {
    const user = client.data.user;
    const sub = user?.sub;
    if (!sub) {
      client.emit('error', { message: 'Unauthorized: Missing user ID' });
      return;
    }

    data.user_id = sub;
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: data.chat_id,
      },
    });

    if (!chat) {
      client.emit('error', `chat with this ${data.chat_id} doesn't exists`);
      return;
    }

    const userId = await this.prisma.user.findUnique({
      where: { id: data.user_id },
    });
    if (!userId) {
      client.emit('error', `user with ID ${data.user_id} not found`);
      return;
    }

    await this.prisma.group_members.delete({
      where: {
        id: data.id,
      },
    });
    console.log('Member successfully deleted');
  }
}
