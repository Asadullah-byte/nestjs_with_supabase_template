import { ApiProperty } from '@nestjs/swagger';
import { User } from '@supabase/supabase-js';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  access_token?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refresh_token?: string;

  @ApiProperty({
    description: 'User information',
  })
  user!: User;

  @ApiProperty({
    description: 'Response message',
    required: false,
    example: 'User created. Please check your email for confirmation.',
  })
  message?: string;
}
