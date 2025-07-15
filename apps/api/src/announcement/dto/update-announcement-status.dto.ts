import { IsEnum, IsNotEmpty } from "class-validator";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum";


// This DTO is used to update the status of an announcement
export class UpdateAnnouncementStatusDto {
  @IsEnum(AnnouncementStatus)
  @IsNotEmpty()
  status: AnnouncementStatus;
}
