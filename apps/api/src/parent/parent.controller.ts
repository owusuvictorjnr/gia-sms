import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { ParentService } from "./parent.service";
import { GetUser } from "src/auth/get-user.decorator";


// This controller handles parent-related routes
@Controller("parent")
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get("my-children")
  findMyChildren(@GetUser() parent: User) {
    // Here you could add a check to ensure parent.role is 'parent'
    return this.parentService.findMyChildren(parent);
  }
}
