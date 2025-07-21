import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "./user.entity";
import { GetUser } from "src/auth/get-user.decorator";

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
  searchAllUsers(
    @Query("query") query: string,
    @GetUser() user: { userId: string }
  ) {
    return this.userService.searchAllUsers(query, user.userId);
  }
}
