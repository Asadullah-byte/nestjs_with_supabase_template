import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetMessagesDto {
  @ApiProperty({
    description: 'Authenticated User ID',
    example: '2f625b2a-c3d2-4869-ae1a-e6c0d477c9e1',
  })
  @IsUUID()
  user_id!: string;
}
