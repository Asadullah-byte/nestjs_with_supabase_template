import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiGetUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get Self' }),
    ApiResponse({ status: 200, description: 'Return the user.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiUpdateUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update Self' }),
    ApiResponse({ status: 200, description: 'User has been updated successfully.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiDeleteUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Self' }),
    ApiResponse({ status: 200, description: 'User has been deleted successfully.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiUpdateMetadata = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update User Metadata' }),
    ApiResponse({ status: 200, description: 'User metadata has been updated successfully.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
  );
};

export const ApiGetProfilePhoto = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get Profile Picture' }),
    ApiResponse({ status: 200, description: 'Profile Pic Fetched' }),
    ApiResponse({ status: 401, description: 'Invalid Token' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
};
export const ApiUploadProfilePhoto = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Upload Profile Picture' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Profile Picture Uploaded Successfully' }),
    ApiResponse({ status: 401, description: 'Invalid Token' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
};
