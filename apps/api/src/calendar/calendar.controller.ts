import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";


// CalendarController handles calendar-related endpoints
// It allows authenticated users to view calendar events and admins to create new events
@Controller("calendar")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN) // Only admins can create calendar events
  create(
    @Body(new ValidationPipe()) createCalendarEventDto: CreateCalendarEventDto,
    @GetUser() user: User
  ) {
    return this.calendarService.create(createCalendarEventDto, user);
  }

  @Get()
  // Any authenticated user can view the calendar
  findAll() {
    return this.calendarService.findAll();
  }
}
