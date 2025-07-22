import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

// AuthService handles user authentication and JWT generation
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Generates a JWT token for the authenticated user
  async login(user: any) {
    // Add firstName and lastName to the JWT payload
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      firstName: user.firstName,
      middleName: user.middleName, // Include middleName if it exists
      lastName: user.lastName,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
