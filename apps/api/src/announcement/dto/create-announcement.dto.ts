import { IsString, IsNotEmpty } from "class-validator";

// This DTO is used to create a new announcement
export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
