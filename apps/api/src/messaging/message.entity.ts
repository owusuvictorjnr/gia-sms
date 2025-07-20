import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Conversation } from './conversation.entity';


/**
 * Message represents a chat message in a conversation.
 * It has a sender, content, and belongs to a specific conversation.
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User)
  sender: User; // The user who sent the message

  @Column()
  senderId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation; // The conversation this message belongs to

  @Column()
  conversationId: string;
}
