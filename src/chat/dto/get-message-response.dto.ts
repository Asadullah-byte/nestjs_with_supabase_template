import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsBoolean } from 'class-validator';

export class MessageResponseDto {
  @ApiProperty({ example: 'ce7fc0f2-7099-4dbf-95f2-2a1fa5d4cb0f' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role!: 'assistant' | 'user' | 'system';

  @ApiProperty({ example: "I don't know either why girls like pink" })
  @IsString()
  content!: string;

  @ApiProperty({ example: new Date().toISOString() })
  created_at!: Date;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_seen!: boolean;
}
