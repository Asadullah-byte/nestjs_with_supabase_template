import { User } from '@supabase/supabase-js';
// Global request for Modified User and Complete User in MiddleWare

interface User extends SupabaseUser {
  id: string;
}
declare global {
  namespace Express {
    interface Request {
      user: User & { id: string };
      complete_user?: any;
    }
  }
}

export {};
