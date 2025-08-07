import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    description: 'ID of the user who wants to join the room',
    example: '1f3e0c8d-b2e3-4e4a-bb8b-3d2b9e83c5a2',
  })
  @IsUUID()
  user_id!: string;
}
