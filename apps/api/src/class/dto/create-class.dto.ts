import { IsString, IsNotEmpty } from "class-validator";

// This DTO is used to create a new class with a name and academic year
export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  academicYear: string;
}