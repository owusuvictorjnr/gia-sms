import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Class } from "./class.entity";
import { ClassService } from "./class.service";
import { User } from "../user/user.entity";
import { ClassController } from "./class.controller";
import { AuthModule } from "../auth/auth.module";
import { TimetableEntry } from "../timetable/timetable.entity"; // Import TimetableEntry

// This module is responsible for managing classes in the application.
@Module({
  imports: [
    TypeOrmModule.forFeature([Class, User, TimetableEntry]), // Add TimetableEntry here
    AuthModule,
  ],
  providers: [ClassService],
  exports: [ClassService],
  controllers: [ClassController],
})
export class ClassModule {}
