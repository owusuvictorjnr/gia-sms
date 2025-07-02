import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [], // We will add other modules here later (e.g., UserModule, AuthModule)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
