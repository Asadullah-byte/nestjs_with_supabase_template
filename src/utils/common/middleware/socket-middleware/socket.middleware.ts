import { Socket } from 'socket.io';
import { AuthenticatedSocket, SupabaseJwtPayload } from 'src/chat/types/socket-user';
import { JwtService } from 'src/jwt-service/jwt-service.service';

export function socketAuthMiddleware(jwtService: JwtService) {
  return (client: Socket, next: (err?: Error) => void) => {
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
      return next(new Error('Unauthorized: No token'));
    }

    jwtService
      .tokenValidation(token)
      .then((payload) => {
        const customClient = client as AuthenticatedSocket;
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

        customClient.data.user = parsedPayload;

        next();
      })

      .catch((err) => {
        console.error(err, 'Invalid token');
        return next(new Error('Unauthorized: invalid token'));
      });
  };
}
