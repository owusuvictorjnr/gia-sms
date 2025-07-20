import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./conversation.entity";
import { Message } from "./message.entity";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { User } from "../user/user.entity";
import { AuthModule } from "../auth/auth.module";


/**
 * MessagingModule handles messaging-related functionality.
 * It allows users to create conversations, send messages, and view their conversations.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [MessagingService],
  exports: [MessagingService],
  controllers: [MessagingController], // Register the MessagingController
})
export class MessagingModule {}
