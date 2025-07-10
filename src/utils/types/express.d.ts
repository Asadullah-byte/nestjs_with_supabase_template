import { User as SupabaseUser } from '@supabase/supabase-js';

// Define a custom User type that includes the id property
interface User extends SupabaseUser {
  id: string;
}

// Extend the Express Request interface with the custom User type
declare global {
  namespace Express {
    interface Request {
      user: User & { id: string };
      complete_user?: any;
    }
  }
}

export {};
