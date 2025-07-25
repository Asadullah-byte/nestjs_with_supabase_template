import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket, SupabaseJwtPayload } from 'src/chat/types/socket-user';
import { JwtService } from 'src/jwt-service/jwt-service.service';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client: AuthenticatedSocket = ctx.switchToWs().getClient();
    const authMethod = process.env.AUTHENTICATED_METHOD;
    let token: string | undefined;
    if (authMethod === 'cookie') {
      const cookie = client.handshake.headers.cookie;
      token = cookie;
    } else if (authMethod === 'jwt') {
      const authHeader = client.handshake.headers.authorization;
      token = authHeader?.split('Bearer ')[1];
    }

    if (!token) {
      throw new WsException('Unauthorized: No token');
    }
    try {
      const payload = (await this.jwtService.tokenValidation(
        token,
      )) as unknown as SupabaseJwtPayload;

      const parsedPayload: SupabaseJwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        session_id: payload.session_id,
        user_metadata: {
          email: payload.user_metadata?.email,
          email_verified: payload.user_metadata?.email_verified,
          firstName: payload.user_metadata?.firstName,
          fullName: payload.user_metadata?.fullName,
          lastName: payload.user_metadata?.lastName,
          phone_verified: payload.user_metadata?.phone_verified,
          sub: payload.user_metadata?.sub,
        },
      };

      client.data.user = parsedPayload;

      return true;
    } catch (err) {
      console.error(err, 'Invalid token');
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
