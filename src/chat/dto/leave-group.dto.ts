import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class LeaveGroupDto {
  @ApiProperty({
    description: 'ID of the user who is leaving the group',
    example: 'f9c7a0e2-321d-4a79-9b10-b2b1f6e4c9f3',
  })
  @IsUUID()
  user_id!: string;

  @ApiProperty({
    description: 'ID of the chat or group being left',
    example: 'a1e3b2d0-12df-4b2b-bc89-328a6b81e6f4',
  })
  @IsUUID()
  chat_id!: string;

  @ApiProperty({
    description: 'ID of the group membership entry (pivot ID)',
    example: 'c58a86a2-1291-43a6-a67f-0b1f37c5fafa',
  })
  @IsUUID()
  id!: string;
}
