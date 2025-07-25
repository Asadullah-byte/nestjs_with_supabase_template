import { Injectable } from '@nestjs/common';
import { jwtVerify } from 'jose';
import { SupabaseJwtPayload } from 'src/chat/types/socket-user';

@Injectable()
export class JwtService {
  async tokenValidation(token: string): Promise<SupabaseJwtPayload> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as SupabaseJwtPayload;
  }
}
