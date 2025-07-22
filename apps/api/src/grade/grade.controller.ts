import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { GradeService } from "./grade.service";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { UpdateGradeDto } from "./dto/update-grade.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

/**
 * GradeController handles all grade-related operations.
 * It provides endpoints for creating, updating, retrieving, and deleting grades.
 */
@Controller("grades")
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  create(
    @Body(new ValidationPipe()) createGradeDto: CreateGradeDto,
    @GetUser() user: any
  ) {
    return this.gradeService.create(createGradeDto, user);
  }

  @Get("/student/:studentId")
  findForStudent(@Param("studentId") studentId: string) {
    return this.gradeService.findForStudent(studentId);
  }


  // Endpoint to update a grade
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  update(
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateGradeDto: UpdateGradeDto,
    @GetUser() user: { userId: string }
  ) {
    return this.gradeService.update(id, updateGradeDto, user.userId);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  remove(@Param("id") id: string, @GetUser() user: { userId: string }) {
    return this.gradeService.remove(id, user.userId);
  }
}
