import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    description: 'Title of the chat',
    example: 'Why Girls like Pink alot?',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;
}
