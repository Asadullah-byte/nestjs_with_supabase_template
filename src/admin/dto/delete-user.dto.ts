import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({
    description: 'Valid user id',
  })
  @IsUUID()
  id!: string;
}
