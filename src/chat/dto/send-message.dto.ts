import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'User UUID Reference to userid', required: true })
  @IsOptional()
  @IsUUID()
  reciever_id?: string;

  @ApiProperty({ description: 'User/client message', example: 'Hello I am Ali' })
  @IsString()
  content!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_seen?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  sender_id!: string;

  @IsOptional()
  updated_at!: Date;

  @IsUUID()
  chat_id!: string;
}
