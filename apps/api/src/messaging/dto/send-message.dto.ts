import { IsString, IsNotEmpty, IsUUID } from "class-validator";


/**
 * DTO for sending a message in a conversation.
 * This class defines the structure of the data required to send a message.
 */
export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
