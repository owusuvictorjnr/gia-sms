import { IsString, IsNotEmpty, IsEnum, IsUUID } from "class-validator";
import { DayOfWeek } from "../timetable.entity";


/**
 * DTO for creating a new timetable entry.
 * This includes the day of the week, start and end times, subject, class ID, and teacher ID.
 */
export class CreateTimetableEntryDto {
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  startTime: string; // e.g., "08:30"

  @IsString()
  @IsNotEmpty()
  endTime: string; // e.g., "09:30"

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsUUID()
  @IsNotEmpty()
  teacherId: string;
}
