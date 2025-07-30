import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient, AuthTokenResponse } from '@supabase/supabase-js';
import { PrismaService } from '@utils/prisma/prisma.service';
import { SupabaseService } from '@utils/supabase/supabase.service';
import { Request } from 'express';
import { Role } from '../enum/role.enum';
interface CustomUser {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  is_deactivated: boolean;
}
interface AuthenticatedRequest extends Request {
  user: CustomUser;
  complete_user?: AuthTokenResponse['data'];
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = this.supabaseService.getPublicClient();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const authMethod = process.env.AUTHENTICATED_METHOD;

    let token: string | undefined;

    if (authMethod === 'cookie') {
      const cookies = request.cookies as Record<string, string> | undefined;
      token = cookies?.['access_token'];
      if (!token) throw new UnauthorizedException('No access cookie found');
      return this.handleJwtAuth(token, request);
    }

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
      const publicUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: true },
      });
      console.log(publicUser);
      if (!publicUser || !publicUser.roles) {
        throw new UnauthorizedException('User not found or roles are mising');
      }
      request.user = {
        id: publicUser?.id,
        email: publicUser?.email,
        role: publicUser.roles.role as Role,
        full_name: publicUser.full_name,
        is_deactivated: publicUser.is_deactivated,
      };
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
      const publicUser = await this.prisma.user.findUnique({
        where: { id: userData.user.id },
        include: { roles: true },
      });
      console.log(publicUser);
      if (!publicUser || !publicUser.roles) {
        throw new UnauthorizedException('User not found or roles are mising');
      }
      request.user = {
        id: publicUser?.id,
        email: publicUser?.email,
        role: publicUser.roles.role as Role,
        full_name: publicUser.full_name,
        is_deactivated: publicUser.is_deactivated,
      };
      request.complete_user = userData;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
