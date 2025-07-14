import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attendance } from "./attendance.entity";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { AuthModule } from "../auth/auth.module";


// The AttendanceModule is responsible for managing attendance-related functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [AttendanceService],
  exports: [AttendanceService],
  controllers: [AttendanceController], // Register the AttendanceController
})
export class AttendanceModule {}
