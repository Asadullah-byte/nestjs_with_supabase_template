import { Module } from '@nestjs/common';
import { JwtService } from './jwt-service.service';

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtServiceModule {}
