import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { ParentController } from "./parent.controller";
import { ParentService } from "./parent.service";
import { AuthModule } from "../auth/auth.module";
import { GradeModule } from "../grade/grade.module";
import { Attendance } from "../attendance/attendance.entity";
import { TimetableModule } from "../timetable/timetable.module"; // Import TimetableModule

// The ParentModule is responsible for managing parent-related functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Attendance]),
    AuthModule,
    GradeModule,
    TimetableModule, // Add TimetableModule to imports
  ],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
