import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { AnnouncementService } from "./announcement.service";
import { AnnouncementController } from "./announcement.controller";
import { AuthModule } from "../auth/auth.module";

// This module is responsible for managing announcements in the application.
// Import necessary modules and services for the Announcement feature
@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard and RolesGuard
  ],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
  controllers: [AnnouncementController], // Register the AnnouncementController
})
export class AnnouncementModule {}
