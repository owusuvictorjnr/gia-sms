import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalendarEvent } from "./calendar.entity";
import { CalendarService } from "./calendar.service";
import { CalendarController } from "./calendar.controller";
import { AuthModule } from "../auth/auth.module";


/**
 * CalendarModule handles calendar-related functionality.
 * It allows admins to create calendar events and users to view them.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [CalendarService],
  exports: [CalendarService],
  controllers: [CalendarController], // Register the CalendarController
})
export class CalendarModule {}
