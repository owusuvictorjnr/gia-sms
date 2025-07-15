import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { UpdateAnnouncementStatusDto } from "./dto/update-announcement-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

// This controller handles all announcement-related routes
@Controller("announcements")
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Roles(UserRole.TEACHER) // Only teachers can create announcements
  create(
    @Body(new ValidationPipe()) createAnnouncementDto: CreateAnnouncementDto,
    @GetUser() author: User
  ) {
    return this.announcementService.create(createAnnouncementDto, author);
  }

  @Get("pending")
  @Roles(UserRole.ADMIN) // Only admins can see pending announcements
  findPending() {
    return this.announcementService.findPending();
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN) // Only admins can update the status
  updateStatus(
    @Param("id") id: string,
    @Body(new ValidationPipe())
    updateAnnouncementStatusDto: UpdateAnnouncementStatusDto,
    @GetUser() admin: User
  ) {
    return this.announcementService.updateStatus(
      id,
      updateAnnouncementStatusDto.status,
      admin
    );
  }
}
