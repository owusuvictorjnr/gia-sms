import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

// This controller handles attendance-related routes
// It uses the AttendanceService to interact with the attendance data
// The JwtAuthGuard is used to protect the routes, ensuring only authenticated users can access them
@Controller("attendance")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createAttendanceDto: CreateAttendanceDto,
    @GetUser() user: User // Get the logged-in teacher
  ) {
    // Here you might add a check to ensure user.role is 'teacher'
    return this.attendanceService.createOrUpdate(createAttendanceDto, user);
  }

  @Get("/:date")
  findForDate(@Param("date") date: string) {
    // Here you might add role checks to see who can view attendance
    return this.attendanceService.findForDate(date);
  }
}
