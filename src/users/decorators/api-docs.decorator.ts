import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiCreateUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiResponse({ status: 201, description: 'User has been created successfully.' }),
    ApiResponse({ status: 400, description: 'Bad request.' }),
  );
};

export const ApiGetUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get a user by id' }),
    ApiResponse({ status: 200, description: 'Return the user.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiUpdateUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update a user' }),
    ApiResponse({ status: 200, description: 'User has been updated successfully.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiDeleteUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a user' }),
    ApiResponse({ status: 200, description: 'User has been deleted successfully.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};
