import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


/**
 * JWT Strategy for Passport.js
 * This strategy extracts the JWT from the request and validates it.
 * It returns the user profile if the token is valid.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    // Return the full user profile from the token
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      middleName: payload.middleName, // Add middleName if it exists
      lastName: payload.lastName,
    };
  }
}
