import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient, AuthResponse, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public supabase_public: SupabaseClient;
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set');
    }

    this.supabase_public = createClient(supabaseUrl, supabaseAnonKey);
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.supabase_public.auth.signUp({
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

  async signOut(): Promise<{ error: Error | null }> {
    try {
      return await this.supabase_public.auth.signOut();
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

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.admin.getUserById(userId);

      if (error) {
        const errorMessage =
          typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
        const errorStack = typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
        this.logger.error(`Error getting user by ID: ${errorMessage}`, errorStack);
        throw error;
      }

      return data.user;
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error getting user by ID: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async getFromTable<T>(table: string, query?: any): Promise<T[]> {
    try {
      let queryBuilder = this.supabase.from(table).select('*');

      if (query && typeof query === 'object') {
        // Use a type-safe approach for handling query parameters
        const typedQuery = query as Record<string, unknown>;
        Object.keys(typedQuery).forEach((key) => {
          queryBuilder = queryBuilder.eq(key, typedQuery[key]);
        });
      }

      const { data, error } = await queryBuilder;

      if (error) {
        const errorMessage =
          typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
        const errorStack = typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
        this.logger.error(`Error getting data from ${table}: ${errorMessage}`, errorStack);
        throw error;
      }

      return data as T[];
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error getting data from ${table}: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async insertIntoTable<T>(table: string, data: any): Promise<T> {
    try {
      const response = await this.supabase.from(table).insert(data).select().single();

      // Type-safe handling of response data
      const result = response.data as T | null;
      const error = response.error;

      if (error) {
        const errorMessage =
          typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
        const errorStack = typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
        this.logger.error(`Error inserting data into ${table}: ${errorMessage}`, errorStack);
        throw error;
      }

      return result as T;
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error inserting data into ${table}: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async updateInTable<T>(table: string, id: string, data: any): Promise<T> {
    try {
      const response = await this.supabase.from(table).update(data).eq('id', id).select().single();

      // Type-safe handling of response data
      const result = response.data as T | null;
      const error = response.error;

      if (error) {
        const errorMessage =
          typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
        const errorStack = typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
        this.logger.error(`Error updating data in ${table}: ${errorMessage}`, errorStack);
        throw error;
      }

      return result as T;
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error updating data in ${table}: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async deleteFromTable(table: string, id: string): Promise<void> {
    try {
      const response = await this.supabase.from(table).delete().eq('id', id);

      const error = response.error;

      if (error) {
        const errorMessage =
          typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
        const errorStack = typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
        this.logger.error(`Error deleting data from ${table}: ${errorMessage}`, errorStack);
        throw error;
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Unknown error';
      const errorStack =
        error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';
      this.logger.error(`Error deleting data from ${table}: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
