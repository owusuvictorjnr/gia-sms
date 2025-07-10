import { Controller, Request, Post, UseGuards, Get } from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard) // Protect this route with the JWT guard
  @Get("profile")
  getProfile(@Request() req) {
    // The JwtStrategy attaches the user payload to the request object
    return req.user;
  }
}
