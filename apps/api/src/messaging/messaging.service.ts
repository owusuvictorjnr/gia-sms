import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Conversation } from "./conversation.entity";
import { Message } from "./message.entity";
import { User } from "../user/user.entity";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";


/**
 * MessagingService handles messaging-related functionality.
 * It allows users to create conversations, send messages, and view their conversations.
 */
@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async createConversation(
    createDto: CreateConversationDto,
    sender: User
  ): Promise<Conversation> {
    const allParticipantIds = [
      ...new Set([sender.id, ...createDto.participantIds]),
    ];

    const participants = await this.usersRepository.findBy({
      id: In(allParticipantIds),
    });

    if (participants.length !== allParticipantIds.length) {
      throw new NotFoundException("One or more participants not found.");
    }

    // Create the new conversation
    const conversation = this.conversationsRepository.create({ participants });
    await this.conversationsRepository.save(conversation);

    // Create the initial message
    const initialMessage = this.messagesRepository.create({
      content: createDto.initialMessage,
      senderId: sender.id,
      conversationId: conversation.id,
    });
    await this.messagesRepository.save(initialMessage);

    return conversation;
  }

  async sendMessage(sendDto: SendMessageDto, sender: User): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      ...sendDto,
      senderId: sender.id,
    });
    return this.messagesRepository.save(newMessage);
  }

  async findMyConversations(user: User): Promise<Conversation[]> {
    return this.conversationsRepository
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participants", "participant")
      .leftJoinAndSelect("conversation.messages", "message")
      .where("participant.id = :userId", { userId: user.id })
      .orderBy("message.createdAt", "DESC")
      .getMany();
  }
}
