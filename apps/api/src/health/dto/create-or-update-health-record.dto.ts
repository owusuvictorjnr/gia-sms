import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator";






/**
 * DTO for creating or updating a health record.
 * This class defines the
 * structure of the data required to create or update a health record.
 * It includes fields for student ID, blood group, allergies,
 * medical conditions, and emergency contact details.
 */
export class CreateOrUpdateHealthRecordDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @IsString()
  @IsNotEmpty()
  emergencyContactPhone: string;

  @IsString()
  @IsNotEmpty()
  emergencyContactRelationship: string;
}
