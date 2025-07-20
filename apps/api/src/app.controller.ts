import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UserService } from "./user/user.service";
import { CreateUserDto } from "./user/dto/create-user.dto";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { GetUser } from "./auth/get-user.decorator";
import { User } from "./user/user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const { password, ...result } =
      await this.userService.create(createUserDto);
    return result;
  }

  @Get("students")
  @UseGuards(JwtAuthGuard)
  async findAllStudents() {
    const students = await this.userService.findAllStudents();
    return students.map(({ password, ...rest }) => rest);
  }

  // New endpoint for general user search, accessible by any logged-in user
  @Get("search")
  @UseGuards(JwtAuthGuard)
  searchAllUsers(@Query("query") query: string, @GetUser() user: User) {
    return this.userService.searchAllUsers(query, user.id);
  }
}
