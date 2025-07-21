import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({ description: 'User/client message', example: 'Hello I am Ali' })
  @IsString()
  content!: string;

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

  @IsOptional()
  @IsUUID()
  message_id!: string;
}
