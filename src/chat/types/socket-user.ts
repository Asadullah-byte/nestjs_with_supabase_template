import { Socket } from 'socket.io';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
  user_metadata: {
    email: string;
    email_verified: boolean;
    firstName: string;
    fullName: string;
    lastName: string;
    phone_verified: boolean;
    sub: string;
  };
  role: string;
  session_id: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: SupabaseJwtPayload;
  };
}
