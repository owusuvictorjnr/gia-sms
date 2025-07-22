import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { TimetableService } from "./timetable.service";
import { CreateTimetableEntryDto } from "./dto/create-timetable-entry.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";


/**
 * TimetableController handles all timetable-related operations.
 * It provides endpoints for creating timetable entries and retrieving schedules for classes and teachers.
 */
@Controller("timetables")
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(
    @Body(new ValidationPipe()) createTimetableEntryDto: CreateTimetableEntryDto
  ) {
    return this.timetableService.create(createTimetableEntryDto);
  }

  @Get("/class/:classId")
  findForClass(@Param("classId") classId: string) {
    return this.timetableService.findForClass(classId);
  }

  // New endpoint for a teacher to get their personal schedule
  @Get("my-schedule")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  findMySchedule(@GetUser() user: { userId: string }) {
    return this.timetableService.findForTeacher(user.userId);
  }
}
