import { Controller, Post, Body, HttpCode, HttpStatus, Req, Delete, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@supabase/supabase-js';
import { Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: User;
}
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiSignUp, ApiSignIn, ApiSignOut, ApiDeleteAccount } from './docs/api-docs.decorator';
import { Auth } from '../utils/common/decorators/auth.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiSignUp()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @ApiSignIn()
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(signInDto, res);
  }

  @Post('signout')
  @Auth()
  @ApiSignOut()
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res?: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.signOut(token, res);
  }

  @Delete('account')
  @Auth()
  @ApiDeleteAccount()
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.authService.deleteAccount(req.user.id);
  }
}
