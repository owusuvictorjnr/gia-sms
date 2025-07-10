import { IsEmail, IsString, MinLength, IsEnum } from "class-validator";
import { UserRole } from "../user.entity";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  middleName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
