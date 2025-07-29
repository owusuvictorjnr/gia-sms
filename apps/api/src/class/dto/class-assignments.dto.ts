import { IsArray, IsUUID, IsInt } from "class-validator";




/**
 * DTO for class assignments, including teachers, students, and parents.
 * This is used to manage the relationships between classes and their members.
 */
export class ClassAssignmentsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  teacherIds: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  studentIds: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  parentIds: string[]; // Since parents are linked through children

  @IsInt()
  timetableEntriesCount: number;
}
