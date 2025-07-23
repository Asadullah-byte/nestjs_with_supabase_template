import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SupabaseModule } from '@utils/supabase/supabase.module';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { JwtServiceModule } from 'src/jwt-service/jwt-service.module';

@Module({
  imports: [SupabaseModule, PrismaModule, JwtServiceModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
