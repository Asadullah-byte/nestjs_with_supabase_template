import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../utils/supabase/supabase.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../user/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.usersService.findByEmail(signUpDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const response = await this.supabaseService.signUp(signUpDto.email, signUpDto.password, {
        data: {
          firstName: signUpDto.firstName,
          lastName: signUpDto.lastName,
          fullName: `${signUpDto.firstName} ${signUpDto.lastName}`,
        },
      });

      if (response.error) {
        this.logger.error(`Supabase signup error: ${response.error.message}`);
        throw new Error(response.error.message);
      }
      if (!response.data.user) {
        throw new Error('Failed to create user account');
      }

      return {
        message: 'User created. Please check your email for confirmation.',
        user: response.data.user,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during signup: ${errorMessage}`);
      throw new InternalServerErrorException('Some error occurred');
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    try {
      const response = await this.supabaseService.signIn(signInDto.email, signInDto.password);

      if (response.error) {
        this.logger.error(`Supabase signin error: ${response.error.message}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!response.data.user || !response.data.session) {
        throw new UnauthorizedException('Authentication failed');
      }

      return {
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
        user: response.data.user,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during signin: ${errorMessage}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async signOut(token?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabaseService.signOut('local', token);

      if (error) {
        this.logger.error(`Supabase signout error: ${error.message}`);
        throw new UnauthorizedException('Failed to sign out');
      }

      return {
        success: true,
        message: 'Successfully signed out',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during signout: ${errorMessage}`);
      throw new UnauthorizedException('Failed to sign out');
    }
  }

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await Promise.all([this.usersService.remove(userId), this.supabaseService.signOut()]);
      return {
        success: true,
        message: 'Account successfully deleted',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting account: ${errorMessage}`);
      throw new UnauthorizedException('Failed to delete account');
    }
  }
}
