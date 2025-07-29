import { HttpException, HttpStatus } from "@nestjs/common";
import { ClassAssignmentsDto } from "src/class/dto/class-assignments.dto";


/**
 * Exception thrown when a class has active assignments.
 * This exception is used to prevent deletion of classes that still have
 * associated teachers, students, or timetable entries.
 */
export class ClassHasAssignmentsException extends HttpException {
  constructor(public assignments: ClassAssignmentsDto) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Class has active assignments",
        assignments,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
