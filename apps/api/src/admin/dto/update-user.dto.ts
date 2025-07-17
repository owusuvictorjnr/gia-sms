import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { UserRole } from '../../user/user.entity';


// This DTO is used to update user information
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
  
  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
