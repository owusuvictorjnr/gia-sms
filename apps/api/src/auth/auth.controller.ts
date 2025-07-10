import { Controller, Request, Post, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth") // All routes will start with /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // Protect this route with our LocalStrategy
  @Post("login")
  async login(@Request() req) {
    // If the LocalAuthGuard succeeds, the user object is attached to the request
    return this.authService.login(req.user);
  }
}
