import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { ParentService } from "./parent.service";
import { GetUser } from "src/auth/get-user.decorator";

// ParentController handles routes related to parents
@Controller("parent")
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get("my-children")
  findMyChildren(@GetUser() parent: User) {
    return this.parentService.findMyChildren(parent);
  }

  // Get details of a specific child by ID

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
}
