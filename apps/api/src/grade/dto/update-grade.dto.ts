import { IsString, IsOptional } from 'class-validator';


/**
 * Data Transfer Object for updating a grade.
 * This DTO is used to validate the data when updating an existing grade.
 */
export class UpdateGradeDto {
  @IsString()
  @IsOptional()
  assessment?: string;

  @IsString()
  @IsOptional()
  score?: string;

  @IsString()
  @IsOptional()
  subject?: string;
}
