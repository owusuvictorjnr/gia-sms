import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { HealthService } from "./health.service";
import { CreateOrUpdateHealthRecordDto } from "./dto/create-or-update-health-record.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";


// This controller handles health records for students.
// It allows admins to create or update health records and view them by student ID.
@Controller("health-records")
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Only admins can create or update health records
  createOrUpdate(
    @Body(new ValidationPipe()) createDto: CreateOrUpdateHealthRecordDto
  ) {
    return this.healthService.createOrUpdate(createDto);
  }

  @Get("student/:studentId")
  @Roles(UserRole.ADMIN) // Only admins can view health records
  findOneByStudentId(@Param("studentId") studentId: string) {
    return this.healthService.findOneByStudentId(studentId);
  }
}
