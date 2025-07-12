import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { AttendanceStatus } from "../attendance.entity";

/**
 * CreateAttendanceDto is used to validate the input data when creating or updating attendance records.
 * It ensures that the date is provided and that each student's record includes a valid student ID and status.
 */
// DTO for a single student's attendance record
class StudentAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}

// Main DTO for submitting the entire roll call
export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  date: string; // Expecting date in "YYYY-MM-DD" format

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  records: StudentAttendanceDto[];
}
 