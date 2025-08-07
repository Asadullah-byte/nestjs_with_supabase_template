import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatDto } from '../dto/create-chat.dto';
import { ChatMessagesResponseDto } from '../dto/chat-messages-reponse.dto';
import { GetMessagesDto } from '../dto/get-message.dto';
import { AddGroupMemberDto } from '../dto/add-group-member.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { LeaveGroupDto } from '../dto/leave-group.dto';
import { SendMessageDto } from '../dto/send-message.dto';

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
export function ApiGetMessages() {
  return applyDecorators(
    ApiOperation({ summary: '[WebSocket] Get all messages in chats for a user' }),
    ApiBody({ type: GetMessagesDto }),
    ApiResponse({
      status: 200,
      description: 'Returns messages grouped by chat',
      type: [ChatMessagesResponseDto],
    }),
    ApiResponse({ status: 400, description: 'Invalid user or unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}
export function ApiAddGroupMember() {
  return applyDecorators(
    ApiOperation({ summary: 'Add a member to a group or chat' }),
    ApiBody({ type: AddGroupMemberDto }),
    ApiResponse({
      status: 201,
      description: 'User added to group successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed or bad request',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiEditMessage() {
  return applyDecorators(
    ApiOperation({ summary: 'Edit a message (WebSocket or HTTP)' }),
    ApiBody({ type: EditMessageDto }),
    ApiResponse({
      status: 200,
      description: 'Message updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or validation error',
    }),
    ApiResponse({
      status: 404,
      description: 'Message not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiJoinRoom() {
  return applyDecorators(
    ApiOperation({ summary: 'Join a chat room (WebSocket or HTTP)' }),
    ApiBody({ type: JoinRoomDto }),
    ApiResponse({
      status: 200,
      description: 'User successfully joined the room',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid user ID or bad request',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiLeaveGroup() {
  return applyDecorators(
    ApiOperation({ summary: 'Leave a group or chat (WebSocket or HTTP)' }),
    ApiBody({ type: LeaveGroupDto }),
    ApiResponse({
      status: 200,
      description: 'User successfully left the group',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or user not in group',
    }),
    ApiResponse({
      status: 404,
      description: 'Group membership entry not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
export function ApiSendMessage() {
  return applyDecorators(
    ApiOperation({ summary: 'Send a chat message (WebSocket or REST)' }),
    ApiBody({ type: SendMessageDto }),
    ApiResponse({
      status: 201,
      description: 'Message sent successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid message payload',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
