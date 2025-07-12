import { IsString, IsNotEmpty, IsUUID } from "class-validator";

// This DTO is used to validate the data when creating a new grade
export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  assessment: string;

  @IsString()
  @IsNotEmpty()
  score: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
