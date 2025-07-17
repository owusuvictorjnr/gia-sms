import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { GradeService } from "./grade.service";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";


/**
 * GradeController handles requests related to student grades.
 * It allows teachers to create grades for students and retrieve grades for a specific student.
 * The controller uses the JwtAuthGuard to protect its routes, ensuring that only authenticated users can access them.
 */
@Controller("grades")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createGradeDto: CreateGradeDto,
    @GetUser() user: any // Use 'any' to match the JWT payload shape
  ) {
    // Here you might add a check to ensure user.role is 'teacher'
    return this.gradeService.create(createGradeDto, user);
  }

  @Get("/student/:studentId")
  findForStudent(@Param("studentId") studentId: string) {
    return this.gradeService.findForStudent(studentId);
  }
}
