import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ClassService } from "./class.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { SetHomeroomTeacherDto } from "./dto/set-homeroom-teacher.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

/**
 * ClassController handles all class-related operations.
 * It provides endpoints for creating classes, assigning users, setting homeroom teachers,
 * and retrieving classes and rosters for teachers.
 */
@Controller("classes")
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body(new ValidationPipe()) createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.classService.findAll();
  }

  @Post("assign-user")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assignUser(@Body(new ValidationPipe()) assignUserDto: AssignUserDto) {
    return this.classService.assignUserToClass(
      assignUserDto.userId,
      assignUserDto.classId
    );
  }

  // Endpoint to set a homeroom teacher for a class
  @Patch(":classId/homeroom-teacher")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  setHomeroomTeacher(
    @Param("classId") classId: string,
    @Body(new ValidationPipe()) setHomeroomTeacherDto: SetHomeroomTeacherDto
  ) {
    return this.classService.setHomeroomTeacher(
      classId,
      setHomeroomTeacherDto.teacherId
    );
  }

  @Get("my-taught-classes") // New endpoint
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  findMyTaughtClasses(@GetUser() teacher: { userId: string }) {
    return this.classService.findClassesForTeacher(teacher.userId);
  }

  @Get("my-class")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyClass(@GetUser() teacherPayload: { userId: string }) {
    return this.classService.findClassByTeacher(teacherPayload);
  }

  @Get("my-roster")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyClassRoster(@GetUser() teacherPayload: { userId: string }) {
    return this.classService.findStudentsByTeacher(teacherPayload);
  }
}
