import { IsUUID, IsNotEmpty } from 'class-validator';


/**
 * Data Transfer Object for setting a homeroom teacher.
 * This DTO is used to validate the data when assigning a homeroom teacher to a class.
 */
export class SetHomeroomTeacherDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;
}
