import { IsString, IsOptional } from "class-validator";

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;
}
