// src/chat/dto/message-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageResponseDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role!: 'assistant' | 'user' | 'system';

  @ApiProperty({ example: "I don't know either why girls like pink" })
  @IsString()
  content!: string;

  @ApiProperty({ example: new Date().toISOString() })
  created_at!: Date;
}
