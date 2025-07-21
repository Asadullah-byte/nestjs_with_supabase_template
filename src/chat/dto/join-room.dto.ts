import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  user_id!: string;
}
