import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeactivateUserDto } from '../dto/deactivate-user.dto';
import { DeleteUserDto } from '../dto/delete-user.dto';

export function ApiGetUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Gets all user with role: user ' }),
    ApiResponse({
      status: 200,
      description: 'All users fetched',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid Token',
    }),
    ApiResponse({
      status: 403,
      description: 'forbidden only accessible to admin',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
export function ApiDeactivateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Provide user id for user to deactivate' }),
    ApiBody({ type: DeactivateUserDto }),
    ApiResponse({
      status: 200,
      description: 'User Deactivated Successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid Token',
    }),
    ApiResponse({
      status: 403,
      description: 'forbidden only accessible to admin',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
export function ApiActivateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Provide user id for user to deactivate' }),
    ApiBody({ type: DeactivateUserDto }),
    ApiResponse({
      status: 200,
      description: 'User Activated Successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid Token',
    }),
    ApiResponse({
      status: 403,
      description: 'forbidden only accessible to admin',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Provide user id for user to deactivate' }),
    ApiBody({ type: DeleteUserDto }),
    ApiResponse({
      status: 200,
      description: 'User Deleted Successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid Token',
    }),
    ApiResponse({
      status: 403,
      description: 'forbidden only accessible to admin',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
