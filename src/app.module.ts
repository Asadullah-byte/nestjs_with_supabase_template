import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './utils/logger/request-logger.middleware';
import { AppConfigModule } from './utils/config/config.module';
import { SystemController } from './utils/system/system.controller';
import { PrismaModule } from './utils/prisma/prisma.module';
import { UsersModule } from './user/users.module';
import { SupabaseModule } from './utils/supabase/supabase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AppConfigModule, PrismaModule, UsersModule, SupabaseModule, AuthModule],
  controllers: [SystemController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
