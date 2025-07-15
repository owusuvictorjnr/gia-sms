import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { LinkParentChildDto } from "./dto/link-parent-child.dto";

// AdminController handles admin-specific routes
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards to all routes in this controller
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("search-users")
  @Roles(UserRole.ADMIN) // Only allow admins to access this route
  searchUsers(@Query("role") role: UserRole, @Query("query") query: string) {
    return this.adminService.searchUsers(role, query);
  }

  @Post("link-parent-child")
  @Roles(UserRole.ADMIN) // Only allow admins to access this route
  linkParentToChild(
    @Body(new ValidationPipe()) linkParentChildDto: LinkParentChildDto
  ) {
    return this.adminService.linkParentToChild(
      linkParentChildDto.parentId,
      linkParentChildDto.childId
    );
  }
}
