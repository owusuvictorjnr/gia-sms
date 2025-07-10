import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users') // This means all routes in this controller will start with /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post() // Handles POST requests to /users
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    // We remove the password from the returned object for security
    const { password, ...result } = await this.userService.create(createUserDto);
    return result;
  }
}
