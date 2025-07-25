import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from './get-message-response.dto';

export class ChatMessagesResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the chat',
    example: '7cbfde9e-4acb-4b9e-998f-07a8f5ae0a99',
  })
  chatId!: string;

  @ApiProperty({
    description: 'List of messages in the chat',
    type: [MessageResponseDto],
  })
  messages!: MessageResponseDto[];
}
