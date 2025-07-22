import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from "class-validator";


/**
 * Data Transfer Object for creating an announcement.
 * This DTO is used to validate the data when creating a new announcement.
 */
export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayMinSize(1)
  classIds: string[];
}
