import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { LinkParentChildDto } from "./dto/link-parent-child.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PromoteStudentsDto } from "./dto/promote-students.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard-stats")
  @Roles(UserRole.ADMIN)
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("accountant-stats")
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  getAccountantDashboardStats() {
    return this.adminService.getAccountantDashboardStats();
  }

  @Get("search-users")
  @Roles(UserRole.ADMIN)
  searchUsers(@Query("role") role: UserRole, @Query("query") query: string) {
    return this.adminService.searchUsers(role, query);
  }

  @Post("link-parent-child")
  @Roles(UserRole.ADMIN)
  linkParentToChild(
    @Body(new ValidationPipe()) linkParentChildDto: LinkParentChildDto
  ) {
    return this.adminService.linkParentToChild(
      linkParentChildDto.parentId,
      linkParentChildDto.childId
    );
  }

  @Post("promotions") // New endpoint for promotions
  @Roles(UserRole.ADMIN)
  promoteStudents(
    @Body(new ValidationPipe()) promoteStudentsDto: PromoteStudentsDto
  ) {
    return this.adminService.promoteStudents(promoteStudentsDto);
  }

  // --- User Management Routes ---

  @Get("users")
  @Roles(UserRole.ADMIN)
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Patch("users/:id") // New endpoint to update a user
  @Roles(UserRole.ADMIN)
  updateUser(
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete("users/:id")
  @Roles(UserRole.ADMIN)
  deleteUser(@Param("id") id: string) {
    return this.adminService.deleteUser(id);
  }
}
