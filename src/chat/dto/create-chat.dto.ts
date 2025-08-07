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

  @ApiProperty({
    required: false,
    example: '2025-07-25T10:30:00Z',
  })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({
    description: 'Creator User ID',
    required: false,
    example: '8b16aaf1-7a9e-4a23-9408-74a5f93f4e77',
  })
  @IsUUID()
  @IsOptional()
  created_by?: string;

  @ApiProperty({
    required: false,
    example: '2025-07-25T11:00:00Z',
  })
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    required: false,
    example: '9e32be78-d83e-4c65-9f9b-c43d7ea644a1',
  })
  @IsUUID()
  @IsOptional()
  receiver_id?: string;

  @ApiProperty({
    description: 'List of user IDs who are members of the chat',
    example: ['uuid-1', 'uuid-2'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  members?: string[];
}
