import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "../user.entity";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @IsString()
  firstName: string;

   @IsOptional() // Optional field for middle name
  @IsString()
  middleName: string;

  @IsString()
  lastName: string;


  @IsEnum(UserRole)
  role: UserRole;
}
