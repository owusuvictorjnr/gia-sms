import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ClassService } from "./class.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

// This controller handles class-related operations such as creating classes, assigning users to classes, and fetching class rosters for teachers.

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

  @Get("my-class") // New endpoint to get the teacher's class
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
