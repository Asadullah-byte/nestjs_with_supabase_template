import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'UUID of the message receiver',
    example: '2b5fd8c6-6d53-4c19-832d-5e7f76092b0a',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  reciever_id?: string;

  @ApiProperty({
    description: 'The message content from user or client',
    example: 'Hello, I am Ali',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Timestamp when the message was created',
    example: new Date().toISOString(),
    required: false,
  })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({
    description: 'Flag to indicate whether the message has been seen',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_seen?: boolean;

  @ApiProperty({
    description: 'UUID of the sender (usually set from the socket)',
    example: '83a0d72a-354c-4e4b-bb3f-98526a0b1fa0',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sender_id?: string;

  @ApiProperty({
    description: 'Timestamp when the message was last updated',
    example: new Date().toISOString(),
    required: false,
  })
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    description: 'ID of the chat in which the message is sent',
    example: '42e1a17b-3c29-4a90-b0ce-dcdcb8d95b27',
  })
  @IsUUID()
  chat_id!: string;
}
