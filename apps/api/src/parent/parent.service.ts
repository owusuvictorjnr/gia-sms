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

// The ParentService is responsible for managing parent-related functionality
@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private gradeService: GradeService,
    private attendanceService: AttendanceService
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
  ): Promise<void> {
    const parentWithChildren = await this.usersRepository.findOne({
      where: { id: parent.id },
      relations: ["children"],
    });

    if (
      !parentWithChildren ||
      !parentWithChildren.children.some((child) => child.id === childId)
    ) {
      throw new UnauthorizedException(
        "You are not authorized to view this child's data."
      );
    }
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

  async getChildAttendanceSummary(parent: User, childId: string) {
    await this.verifyParentChildLink(parent, childId);
    // In a real app, you would fetch records for the current term and calculate the summary.
    // For this example, we will return mock data.
    return {
      present: 58,
      absent: 2,
      late: 1,
    };
  }
}
