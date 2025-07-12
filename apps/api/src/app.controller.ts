import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user/user.service";
import { CreateUserDto } from "./user/dto/create-user.dto";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { AppService } from "./app.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    // We remove the password from the returned object for security
    const { password, ...result } =
      await this.userService.create(createUserDto);
    return result;
  }

  // New endpoint to get all students
  @Get("students")
  @UseGuards(JwtAuthGuard) // Protect this route so only logged-in users can access it
  async findAllStudents() {
    const students = await this.userService.findAllStudents();
    // Return the list of students, making sure to exclude their passwords
    return students.map(({ password, ...rest }) => rest);
  }
}
