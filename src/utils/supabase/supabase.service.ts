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
// eyJhbGciOiJIUzI1NiIsImtpZCI6ImEyZmxXNUt5WVBqTlQxN0IiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL29jdGFpdWFsc3hzcmJvaW9yZHJhLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZmRjMDA2ZS1kM2Y3LTQ2OTgtYTZhNC0zY2I1NTFkZTBiMzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMTM0Nzk0LCJpYXQiOjE3NTIxMzExOTQsImVtYWlsIjoidm9nZXNpNjU0NUBiaW5hZmV4LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ2b2dlc2k2NTQ1QGJpbmFmZXguY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0TmFtZSI6IkpvaG4iLCJmdWxsTmFtZSI6IkpvaG4gRG9lIiwibGFzdE5hbWUiOiJEb2UiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjBmZGMwMDZlLWQzZjctNDY5OC1hNmE0LTNjYjU1MWRlMGIzOSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTc1MjEzMTE5NH1dLCJzZXNzaW9uX2lkIjoiODY3ZmE5M2EtNWJlMS00Mzk3LWIyNWItMTAwMjRlMzJjMzZmIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.oHTO5aTZ8BCCvNHrueH3lp29KrU563dOGuwO2fYE_B8
