import { ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@utils/prisma/prisma.service';
import { ChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { LeaveGroupDto } from './dto/leave-group.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import * as nodemailer from 'nodemailer';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    const authMethod = process.env.AUTHENTICATED_METHOD;
    let token: string[] | string | undefined;
    if (authMethod === 'cookie') {
      const cookie = client.handshake.headers.cookie;
      token = cookie;
    } else if (authMethod === 'jwt') {
      const authHeader = client.handshake.headers.authorization;
      token = authHeader?.split('Bearer ')[1];
    }

    if (!token) {
      console.log('No token found — disconnecting client');
      client.disconnect();
      return;
    }
  }
  @SubscribeMessage('initiateChat')
  async handleInitiateChat(
    @MessageBody(ValidationPipe) data: ChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      let chatData;
      let membersToAdd: string[] = [];
      let recieverName: string | null = null;

      if (data.members && data.members.length > 0) {
        const allMembers = [data.created_by, ...data.members];
        if (!data.name) {
          const searchUsers = await Promise.all(
            data.members.map((userId) =>
              this.prisma.user.findUnique({
                where: { id: userId },
                select: { metadata: true },
              }),
            ),
          );

          const usersName = searchUsers.map((user) => {
            const metadata = user?.metadata as { fullName?: string };
            return metadata?.fullName ?? 'Unnamed';
          });
          console.log(usersName);
          chatData = {
            name: usersName.join(',') || 'Group chat',
            created_by: data.created_by,
            members: allMembers,
          };
          membersToAdd = allMembers;
        }
      } else if (data.reciever_id) {
        const allMembers = [data.created_by, data.reciever_id];
        const chatExists = await this.prisma.chat.findFirst({
          where: {
            OR: [
              { created_by: data.created_by, reciever_id: data.reciever_id },
              { created_by: data.reciever_id, reciever_id: data.created_by },
            ],
          },
          select: { id: true },
        });
        if (chatExists) {
          client.emit('error', {
            message: `Chat already exist between ${data.created_by} and ${data.reciever_id}`,
          });
          return;
        }
        const reciever = await this.prisma.user.findUnique({
          where: { id: data.reciever_id },
          select: { metadata: true },
        });
        const metadata = reciever?.metadata as { fullName?: string } | undefined;
        recieverName = metadata?.fullName ?? 'Unamed';

        chatData = {
          name: data.name || null,
          reciever_id: data.reciever_id,
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
        this.prisma.groupMembers.create({
          data: {
            chat_id: createdChat.id,
            user_id: userId,
          },
        }),
      );
      await Promise.all(addMembers);

      const chatName = `chat_${createdChat.id}`;
      await client.join(chatName);
      client.to(chatName).emit('chatCreated', { chat: createdChat, chatName });
      if (membersToAdd.length > 1) {
        client.to(chatName).emit('joinChatRoom', {
          chat: createdChat,
          chatName: chatName,
          members: membersToAdd,
          recieverName: recieverName || null,
        });
      }
    } catch (error) {
      console.error('Error Creating chat', error);
      this.server.emit('error', { message: 'Failed to create chat' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody(ValidationPipe) data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chat_id },
      include: {
        groupMembers: {
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
    const memberIds = chat.groupMembers.map((member) => member.user_id);

    if (!memberIds.includes(data.sender_id)) {
      client.emit('error', { message: 'You are not member of this group' });
    }

    const sendMessage = await this.prisma.message.create({
      data: {
        chat_id: data.chat_id,
        content: data.content,
        sender_id: data.sender_id,
        reciever_id: null,
        is_seen: false,
      },
    });
    const chatName = `chat_${sendMessage.chat_id}`;
    await client.join(chatName);
    client.to(chatName).emit('message', sendMessage);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) data: JoinRoomDto,
  ) {
    const chats = (await this.prisma.groupMembers.findMany({
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
  @SubscribeMessage('getMessages')
  async handleGetPrivateMessage(
    @MessageBody() data: { user_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const chats = await this.prisma.chat.findMany({
      where: {
        groupMembers: {
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

    await this.prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { is_seen: true },
    });
    client.emit('message', { chatMessages });
  }

  @SubscribeMessage('editMessages')
  async handleEditMessage(
    @MessageBody(ValidationPipe) data: EditMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
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
        where: { id: editMessage.chat_id },
        data: { updated_at: new Date() },
      });
      client.emit('messageEdited', { editMessage });
    } else {
      client.emit('error', 'you cna not edit the message');
      return;
    }
  }
  @SubscribeMessage('addMember')
  async handleAddMember(
    @MessageBody(ValidationPipe) data: AddGroupMemberDto,
    @ConnectedSocket() client: Socket,
  ) {
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
        groupMembers: {
          select: { user_id: true, user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!groupExists) {
      client.emit('error', { message: 'Group not found' });
      return;
    }

    const memberExists = groupExists.groupMembers.some((member) => member.user_id === data.user_id);

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
    await this.prisma.groupMembers.create({
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
    const updateGroupMembers = groupExists.groupMembers
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

  @SubscribeMessage('leaveGroup')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) data: LeaveGroupDto,
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: data.chat_id,
      },
    });

    if (!chat) {
      client.emit('error', `chat with this ${data.chat_id} doesn't exists`);
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: data.user_id },
    });
    if (!user) {
      client.emit('error', `user with ID ${data.user_id} not found`);
      return;
    }

    await this.prisma.groupMembers.delete({
      where: {
        id: data.id,
      },
    });
    console.log('Member successfully deleted');
  }
}
