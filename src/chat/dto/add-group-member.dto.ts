import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddGroupMemberDto {
  @ApiProperty({ description: 'Group id', required: true })
  @IsString()
  chat_id!: string;

  @ApiProperty({
    description: 'Must be UUID v4',
    example: '00b10d39-7fe7-49d5-9d91-513c2d7eb533',
    required: true,
  })
  @IsUUID()
  user_id!: string;

  @IsUUID()
  created_by!: string;
}
