import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from 'src/chat/types/socket-user';

@Injectable()
export class SocketGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const client: AuthenticatedSocket = ctx.switchToWs().getClient();
    try {
      if (!client.data.user) {
        throw new WsException('Unauthorized: No User found in client data');
      }
      console.log('this is client data: ', client.data);
      return true;
    } catch (err) {
      console.error(err, 'Invalid token');
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
