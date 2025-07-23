import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { GradeService } from "../grade/grade.service";
import { AttendanceService } from "../attendance/attendance.service";
import { Attendance } from "src/attendance/attendance.entity";
import { AttendanceStatus } from "shared-types/src/attendance-status.enum";
import { TimetableService } from "src/timetable/timetable.service";

// The ParentService is responsible for managing parent-related functionality
@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private gradeService: GradeService,
    private timetableService: TimetableService // Inject TimetableService
  ) {}

  /**
   * Verifies if the parent is linked to the child.
   * Throws UnauthorizedException if not linked.
   * @param parent The parent user.
   * @param childId The ID of the child.
   */

  private async verifyParentChildLink(
    parent: User,
    childId: string
  ): Promise<User> {
    const parentWithChildren = await this.usersRepository.findOne({
      where: { id: parent.id },
      relations: ["children"],
    });
    const child = parentWithChildren?.children.find((c) => c.id === childId);

    if (!child) {
      throw new UnauthorizedException(
        "You are not authorized to view this child's data."
      );
    }
    return child;
  }

  async findMyChildren(parent: User): Promise<User[]> {
    const parentWithChildren = await this.usersRepository.findOne({
      where: { id: parent.id },
      relations: ["children"],
    });

    if (!parentWithChildren) {
      throw new NotFoundException("Parent not found");
    }

    return parentWithChildren.children.map(
      ({ password, ...rest }) => rest as User
    );
  }

  /**
   * Get the latest 5 grades for a specific child.
   * @param parent The parent requesting the grades.
   * @param childId The ID of the child whose grades are requested.
   * @returns An array of the latest 5 grades for the child.
   */
  async getChildGrades(parent: User, childId: string) {
    await this.verifyParentChildLink(parent, childId);
    // Fetch the latest 5 grades for the dashboard widget
    const grades = await this.gradeService.findForStudent(childId);
    return grades.slice(0, 5);
  }

  // New method to get a child's timetable
  async getChildTimetable(parent: User, childId: string) {
    const child = await this.verifyParentChildLink(parent, childId);

    if (!child.classId) {
      throw new NotFoundException(
        "This student is not currently assigned to a class."
      );
    }

    return this.timetableService.findForClass(child.classId);
  }

  async getChildAttendanceSummary(parent: User, childId: string) {
    await this.verifyParentChildLink(parent, childId);

    // Fetch all attendance records for the student
    const records = await this.attendanceRepository.find({
      where: { studentId: childId },
    });

    // Calculate the summary
    const summary = {
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT)
        .length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT)
        .length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
    };

    return summary;
  }
}
