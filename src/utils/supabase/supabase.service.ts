import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient, AuthResponse } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public supabase_public: SupabaseClient;
  //private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set');
    }

    this.supabase_public = createClient(supabaseUrl, supabaseAnonKey);
    //this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  getPublicClient(): SupabaseClient {
    return this.supabase_public;
  }

  getClientWithAuth(token: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey)
      throw new Error('Supabase Url or Anon Key Missing');
    console.log(token);
    return createClient(supabaseUrl, supabaseServiceKey, {
      // global: {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // },
    });
  }

  async signUp(
    email: string,
    password: string,
    options?: Record<string, unknown>,
  ): Promise<AuthResponse> {
    try {
      const response = await this.supabase_public.auth.signUp({
        email,
        password,
        options: options,
      });
      return response;
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error signing up user: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.supabase_public.auth.signInWithPassword({
        email,
        password,
      });
      return response;
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error signing in user: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async signOut(
    scope: 'local' | 'global' | 'others' = 'local',
    token?: string,
  ): Promise<{ error: Error | null }> {
    try {
      if (token) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase environment variables are not set');
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        await supabaseClient.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        return await supabaseClient.auth.signOut({ scope });
      }

      return await this.supabase_public.auth.signOut({ scope });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error signing out user: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
