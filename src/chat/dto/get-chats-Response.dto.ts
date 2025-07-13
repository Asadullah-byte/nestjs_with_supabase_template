// src/chat/dto/chat-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from './get-message-response.dto';

export class ChatResponseDto {
  @ApiProperty({ example: '47f3b2de-0e28-4f8e-9d3e-76de4f4f2260' })
  id!: string;

  @ApiProperty({ example: 'Why girls like pink??' })
  title!: string;

  @ApiProperty({ example: new Date().toISOString() })
  created_at!: Date;

  @ApiProperty({ type: [MessageResponseDto] })
  messages!: MessageResponseDto[];
}
