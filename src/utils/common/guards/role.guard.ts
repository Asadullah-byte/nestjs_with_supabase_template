import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { AuthTokenResponse } from '@supabase/supabase-js';

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
export class RolesGuards implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requiredRoles) return true;
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }
}
