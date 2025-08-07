import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerateImageDto } from '../dto/generate-image.dto';
import { EditImageDto } from '../dto/edit-image.dto';

export const ApiGenerateImage = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Generate an AI image' }),
    ApiBody({ type: GenerateImageDto }),
    ApiResponse({
      status: 200,
      description: 'Image Generate Successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
    }),
    ApiResponse({
      status: 403,
      description: 'Invalid Token',
    }),
  );
};
export const ApiEditImage = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Edit an AI image' }),
    ApiBody({ type: EditImageDto }),
    ApiResponse({
      status: 200,
      description: 'Edited Image Generated Successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
    }),
    ApiResponse({
      status: 403,
      description: 'Invalid Token',
    }),
  );
};
