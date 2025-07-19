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
import { UserRole } from "../user/user.entity";


/**
 * This controller handles timetable-related operations such as creating timetable entries and fetching timetables for classes.
 */

@Controller("timetables")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Only admins and teachers can create entries
  create(
    @Body(new ValidationPipe()) createTimetableEntryDto: CreateTimetableEntryDto
  ) {
    return this.timetableService.create(createTimetableEntryDto);
  }

  @Get("/class/:classId")
  // Any authenticated user can view a class timetable
  findForClass(@Param("classId") classId: string) {
    return this.timetableService.findForClass(classId);
  }
}
