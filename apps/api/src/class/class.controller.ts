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

  @Patch(":id") // New endpoint to update a class
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateClassDto: UpdateClassDto
  ) {
    return this.classService.update(id, updateClassDto);
  }

  @Delete(":id") // New endpoint to delete a class
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.classService.remove(id);
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

  @Get("my-roster")
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyClassRoster(@GetUser() teacherPayload: { userId: string }) {
    return this.classService.findStudentsByTeacher(teacherPayload);
  }
}
