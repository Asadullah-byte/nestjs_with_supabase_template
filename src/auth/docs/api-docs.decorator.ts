import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SignUpDto } from '../dto/sign-up.dto';
import { SignInDto } from '../dto/sign-in.dto';

export function ApiSignUp() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: SignUpDto }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 409,
      description: 'User with this email already exists',
    }),
  );
}

export function ApiSignIn() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign in with email and password' }),
    ApiBody({ type: SignInDto }),
    ApiResponse({
      status: 200,
      description: 'User successfully authenticated',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
    }),
  );
}

export function ApiSignOut() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign out current user' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User successfully signed out',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
}

export function ApiDeleteAccount() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user account' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Account successfully deleted',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
}
