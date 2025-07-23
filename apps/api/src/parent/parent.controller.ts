import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { ParentService } from "./parent.service";
import { GetUser } from "src/auth/get-user.decorator";

@Controller("parent")
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get("my-children")
  findMyChildren(@GetUser() parent: User) {
    return this.parentService.findMyChildren(parent);
  }

  @Get("child/:childId/grades")
  getChildGrades(@GetUser() parent: User, @Param("childId") childId: string) {
    return this.parentService.getChildGrades(parent, childId);
  }

  @Get("child/:childId/attendance-summary")
  getChildAttendanceSummary(
    @GetUser() parent: User,
    @Param("childId") childId: string
  ) {
    return this.parentService.getChildAttendanceSummary(parent, childId);
  }

  // New endpoint for a child's timetable
  @Get("child/:childId/timetable")
  getChildTimetable(
    @GetUser() parent: User,
    @Param("childId") childId: string
  ) {
    return this.parentService.getChildTimetable(parent, childId);
  }
}
