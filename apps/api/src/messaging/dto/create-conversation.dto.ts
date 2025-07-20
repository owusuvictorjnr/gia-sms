import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  IsString,
  IsNotEmpty,
} from "class-validator";

/**
 * DTO for creating a new conversation.
 * This class defines the structure of the data required to create a conversation.
 */

export class CreateConversationDto {
  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayMinSize(1)
  participantIds: string[]; // Array of user IDs to include in the conversation

  @IsString()
  @IsNotEmpty()
  initialMessage: string; // The first message to start the conversation
}
