import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";


/**
 * MessagingController handles messaging-related endpoints.
 * It allows users to create conversations, send messages, and view their conversations.
 */
@Controller("messaging")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post("conversations")
  createConversation(
    @Body(new ValidationPipe()) createConversationDto: CreateConversationDto,
    @GetUser() sender: User
  ) {
    return this.messagingService.createConversation(
      createConversationDto,
      sender
    );
  }

  @Post("messages")
  sendMessage(
    @Body(new ValidationPipe()) sendMessageDto: SendMessageDto,
    @GetUser() sender: User
  ) {
    return this.messagingService.sendMessage(sendMessageDto, sender);
  }

  @Get("my-conversations")
  findMyConversations(@GetUser() user: User) {
    return this.messagingService.findMyConversations(user);
  }
}
