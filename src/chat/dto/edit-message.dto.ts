import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({
    description: 'Updated message content',
    example: 'Hello, I am Ali',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Mark message as seen or not',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_seen?: boolean;

  @ApiProperty({
    description: 'ID of the sender editing the message',
    required: false,
    example: 'c5b60c79-9270-420e-bb70-2a9ce3e21847',
  })
  @IsOptional()
  @IsUUID()
  sender_id?: string;

  @ApiProperty({
    description: 'Timestamp of when the message was edited',
    required: false,
    example: new Date().toISOString(),
  })
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    description: 'ID of the message to be edited',
    required: false,
    example: 'd3f4b7e8-3e34-45c9-84ea-435c1c3fe21f',
  })
  @IsOptional()
  @IsUUID()
  message_id?: string;
}
