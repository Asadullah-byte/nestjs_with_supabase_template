import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatDto } from '../dto/create-chat.dto';

export function ApiCreateChat() {
  return applyDecorators(
    ApiOperation({ summary: 'Creates a new chat' }),
    ApiBody({ type: ChatDto }),
    ApiResponse({
      status: 201,
      description: 'Chat Successfully created',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 500,
      description: 'Server not running',
    }),
  );
}
export function ApiGetChats() {
  return applyDecorators(
    ApiOperation({ summary: 'Creates a new chat' }),
    ApiResponse({
      status: 201,
      description: 'Chat Successfully created',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 500,
      description: 'Server not running',
    }),
  );
}
