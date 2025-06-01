import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VariablesService {
  constructor(private configService: ConfigService) {}

  get<T>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    const value = this.configService.get<T>(key);
    return value === undefined ? defaultValue : value;
  }

  get port(): number {
    return this.getOrDefault<number>('PORT', 3000);
  }

  get environment(): string {
    return this.getOrDefault<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get jwtSecret(): string {
    return this.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): number {
    return this.getOrDefault<number>('JWT_EXPIRES_IN', 3600);
  }
}
