import { IsUUID } from 'class-validator';

export class LeaveGroupDto {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  chat_id!: string;

  @IsUUID()
  id!: string;
}
