import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { AttendanceStatus } from "shared-types/src/attendance-status.enum";

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
