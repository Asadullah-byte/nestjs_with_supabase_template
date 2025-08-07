import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeactivateUserDto {
  @ApiProperty({
    description: 'Valid user id',
  })
  @IsUUID()
  id!: string;
}
