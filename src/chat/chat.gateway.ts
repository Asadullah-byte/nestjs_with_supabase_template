import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}
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

    console.log('Client connected with token:', token);
  }

  handleDisconnect(client: Socket) {
    let token: string[] | string | undefined;
    if (!token) {
      console.log('No token found — disconnecting client');
      client.disconnect();
      return;
    }
  }
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { chatId: string; content: string }) {
    const userMessage = payload.content;

    await this.chatService.saveMessage({
      chatId: payload.chatId,
      role: 'user',
      content: userMessage,
    });

    const assistantResponse = await this.chatService.getGeminiResponse(userMessage);

    const savedAssistantMessage = await this.chatService.saveMessage({
      chatId: payload.chatId,
      role: 'assistant',
      content: assistantResponse,
    });
    console.log('Emitting assistantMessage:', savedAssistantMessage);
    client.emit('assistantMessage', savedAssistantMessage);
  }
}
