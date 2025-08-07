import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddGroupMemberDto {
  @ApiProperty({
    description: 'ID of the chat or group',
    example: 'd6f13a88-42c2-4d3c-8915-5d05cc82c76e',
    required: true,
  })
  @IsUUID()
  chat_id!: string;

  @ApiProperty({
    description: 'ID of the user being added to the group',
    example: '00b10d39-7fe7-49d5-9d91-513c2d7eb533',
    required: true,
  })
  @IsUUID()
  user_id!: string;

  @ApiProperty({
    description: 'ID of the user who is adding the member',
    example: 'ba3e0a3e-c0c3-4f0f-95ae-18a3036fbd1f',
    required: true,
  })
  @IsUUID()
  created_by!: string;
}
