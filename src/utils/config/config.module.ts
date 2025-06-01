import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VariablesService } from './config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  providers: [VariablesService],
  exports: [VariablesService],
})
export class AppConfigModule {}
