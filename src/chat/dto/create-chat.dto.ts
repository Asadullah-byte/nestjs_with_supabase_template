import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    description: 'Title of the chat',
    example: 'Why Girls like Pink alot?',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  created_at?: Date;

  @IsUUID()
  @IsOptional()
  created_by?: string;

  @IsOptional()
  updated_at?: Date;

  @IsUUID()
  @IsOptional()
  receiver_id?: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}
