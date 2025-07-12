import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attendance } from "./attendance.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Attendance])],
  providers: [], // We will add AttendanceService here soon
  controllers: [], // We will add AttendanceController here soon
})
export class AttendanceModule {}
