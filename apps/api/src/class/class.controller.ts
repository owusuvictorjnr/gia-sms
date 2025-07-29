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
  ParseUUIDPipe,
} from "@nestjs/common";
import { ClassService } from "./class.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { SetHomeroomTeacherDto } from "./dto/set-homeroom-teacher.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { ClassAssignmentsDto } from "./dto/class-assignments.dto";

/**
 * ClassController handles class-related operations such as creating classes,
 * assigning users to classes, setting homeroom teachers, and retrieving class rosters.
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

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateClassDto: UpdateClassDto
  ) {
    return this.classService.update(id, updateClassDto);
  }


  // Handles class deletion with optional force delete and student reassignment
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() body: { force?: boolean; moveStudentsTo?: string }
  ) {
    return this.classService.removeClass(id, {
      force: body.force,
      moveStudentsTo: body.moveStudentsTo,
      unassignTeachers: true, // Always unassign teachers in force delete
    });
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

  @Get("my-taught-classes")
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

  @Get("my-homeroom-roster")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyHomeroomRoster(@GetUser() teacher: { userId: string }) {
    return this.classService.findStudentsByHomeroomTeacher(teacher.userId);
  }

  // Add these to ClassController

  @Get(":id/users")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getClassUsers(@Param("id") id: string) {
    return this.classService.getClassUsers(id);
  }

  @Patch("teachers/:teacherId/unassign")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  unassignTeacher(@Param("teacherId") teacherId: string) {
    return this.classService.unassignTeacher(teacherId);
  }

  @Post(":id/move-students/:targetClassId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  moveStudents(
    @Param("id") id: string,
    @Param("targetClassId") targetClassId: string
  ) {
    return this.classService.moveStudents(id, targetClassId);
  }

  // src/class/class.controller.ts
  @Get(":id/assignments")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getClassAssignments(
    @Param("id", new ParseUUIDPipe()) id: string
  ): Promise<ClassAssignmentsDto> {
    return this.classService.getClassAssignments(id);
  }
}
