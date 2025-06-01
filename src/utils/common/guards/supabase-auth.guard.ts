import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient, User, AuthTokenResponse } from '@supabase/supabase-js';
import { SupabaseService } from '@utils/supabase/supabase.service';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
  user: User;
  complete_user?: AuthTokenResponse['data'];
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getPublicClient();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('No authentication provided');
    }

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      return this.handleJwtAuth(token, request as unknown as AuthenticatedRequest);
    } else if (authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      return this.handleBasicAuth(base64Credentials, request as unknown as AuthenticatedRequest);
    }

    throw new UnauthorizedException('Invalid authentication method');
  }
  private async handleJwtAuth(token: string, request: AuthenticatedRequest): Promise<boolean> {
    try {
      const response = await this.supabase.auth.getUser(token);
      const user = response.data.user;
      const responseError = response.error;

      if (responseError || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async handleBasicAuth(
    base64Credentials: string,
    request: AuthenticatedRequest,
  ): Promise<boolean> {
    try {
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const credentialParts = credentials.split(':');
      const email = credentialParts[0];
      const password = credentialParts[1];

      if (!email || !password) {
        throw new UnauthorizedException('Invalid credentials format');
      }

      const response = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      const userData = response.data;
      const responseError = response.error;

      if (responseError || !userData.user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      request.user = userData.user;
      request.complete_user = userData;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
