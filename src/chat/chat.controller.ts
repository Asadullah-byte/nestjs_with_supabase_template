import { Controller, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@utils/common/guards/supabase-auth.guard';
// import { ChatDto } from './dto/create-chat.dto';
// import { User } from '@supabase/supabase-js';
// import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
// import { Chat } from '@prisma/client';
// import { ApiCreateChat, ApiGetChats } from './docs/api-docs.decorator';
// import { ChatResponseDto } from './dto/get-chats-Response.dto';

// interface AuthenticatedRequest extends Request {
//   user: User;
// }
@ApiTags('Chat')
@UseGuards(SupabaseAuthGuard)
@Controller('chat')
export class ChatController {}
