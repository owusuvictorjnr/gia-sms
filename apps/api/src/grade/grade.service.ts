import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grade } from "./grade.entity";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { UpdateGradeDto } from "./dto/update-grade.dto";


/**
 * GradeService handles the business logic for grade management,
 * including creating grades, retrieving grades for students,
 * updating grades, and deleting grades.
 */
@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>
  ) {}

  async create(createGradeDto: CreateGradeDto, teacher: any): Promise<Grade> {
    const newGrade = this.gradesRepository.create({
      ...createGradeDto,
      teacherId: teacher.userId,
    });
    return this.gradesRepository.save(newGrade);
  }

  async findForStudent(studentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { studentId },
      order: { date: "DESC" },
    });
  }

  // New method to update a grade
  async update(
    gradeId: string,
    updateGradeDto: UpdateGradeDto,
    teacherId: string
  ): Promise<Grade> {
    const grade = await this.gradesRepository.findOneBy({ id: gradeId });

    if (!grade) {
      throw new NotFoundException(`Grade with ID "${gradeId}" not found.`);
    }
    if (grade.teacherId !== teacherId) {
      throw new UnauthorizedException(
        "You are not authorized to edit this grade."
      );
    }

    Object.assign(grade, updateGradeDto);
    return this.gradesRepository.save(grade);
  }

  // New method to delete a grade
  async remove(
    gradeId: string,
    teacherId: string
  ): Promise<{ message: string }> {
    const grade = await this.gradesRepository.findOneBy({ id: gradeId });

    if (!grade) {
      throw new NotFoundException(`Grade with ID "${gradeId}" not found.`);
    }
    if (grade.teacherId !== teacherId) {
      throw new UnauthorizedException(
        "You are not authorized to delete this grade."
      );
    }

    await this.gradesRepository.remove(grade);
    return { message: "Grade deleted successfully." };
  }
}
