import { Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { Chat } from '@prisma/client';
import { ChatResponseDto } from './dto/get-chats-Response.dto';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: string, title?: string): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: {
        user_Id: userId,
        title,
      },
    });
    return chat;
  }

  async getAllChat(userId: string): Promise<ChatResponseDto[]> {
    const chats = await this.prisma.chat.findMany({
      where: { user_Id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        messages: { orderBy: { created_at: 'asc' } },
      },
    });
    return chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      created_at: chat.created_at,
      messages: chat.messages.map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content,
        created_at: message.created_at,
      })),
    }));
  }

  async saveMessage(data: { chatId: string; role: 'user' | 'assistant'; content: string }) {
    const messages = await this.prisma.message.create({
      data: {
        chat_id: data.chatId,
        role: data.role,
        content: data.content,
      },
    });
    return messages;
  }

  async getGeminiResponse(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const responseText = result.text || 'No content generated';
      return responseText;
    } catch {
      throw new Error('Error generating content from Gemini AI');
    }
  }
}
