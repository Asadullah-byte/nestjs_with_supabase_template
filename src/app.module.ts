import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './utils/logger/request-logger.middleware';
import { AppConfigModule } from './utils/config/config.module';
import { SystemController } from './utils/system/system.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [SystemController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
