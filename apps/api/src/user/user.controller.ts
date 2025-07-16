import { Controller, Post, Body, ValidationPipe, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // This endpoint is for creating new users (e.g., during registration)
  @Post()
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    // We remove the password from the returned object for security
    const { password, ...result } = await this.userService.create(createUserDto);
    return result;
  }

  // This endpoint gets all users with the 'student' role.
  // It is used by admins/teachers to populate dropdowns.
  @Get('students')
  @UseGuards(JwtAuthGuard) // Protect this route
  async findAllStudents() {
    const students = await this.userService.findAllStudents();
    // Return the list of students, making sure to exclude their passwords
    return students.map(({ password, ...rest }) => rest);
  }
}
