import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@utils/common/guards/supabase-auth.guard';
import { ChatDto } from './dto/create-chat.dto';
import { User } from '@supabase/supabase-js';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { Chat } from '@prisma/client';
import { ApiCreateChat, ApiGetChats } from './docs/api-docs.decorator';
import { ChatResponseDto } from './dto/get-chats-Response.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}
@ApiTags('Chat')
@UseGuards(SupabaseAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiCreateChat()
  @HttpCode(HttpStatus.CREATED)
  async createChat(@Body() chatDto: ChatDto, @Req() req: AuthenticatedRequest): Promise<Chat> {
    const userId = req.user.id;
    return this.chatService.createChat(userId, chatDto.title);
  }

  @Get()
  @ApiGetChats()
  @HttpCode(HttpStatus.ACCEPTED)
  async getAllChats(@Req() req: AuthenticatedRequest): Promise<ChatResponseDto[]> {
    const userId = req.user.id;
    return this.chatService.getAllChat(userId);
  }
}
