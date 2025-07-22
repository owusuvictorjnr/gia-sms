import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { AnnouncementService } from "./announcement.service";
import { AnnouncementController } from "./announcement.controller";
import { AuthModule } from "../auth/auth.module";
import { Class } from "../class/class.entity"; // Import Class entity

// Import necessary entities and modules
// This module is responsible for managing announcements in the application.
@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, Class]), // Add Class repository
    AuthModule,
  ],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
  controllers: [AnnouncementController],
})
export class AnnouncementModule {}
