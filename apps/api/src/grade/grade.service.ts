import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grade } from "./grade.entity";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { User } from "../user/user.entity";

// The GradeService is responsible for managing grades in the application.

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>
  ) {}

  async create(createGradeDto: CreateGradeDto, teacher: any): Promise<Grade> {
    const newGrade = this.gradesRepository.create({
      ...createGradeDto,
      teacherId: teacher.userId, // FIX: Use teacher.userId from the JWT payload
    });

    return this.gradesRepository.save(newGrade);
  }

  async findForStudent(studentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { studentId },
      order: { date: "DESC" }, // Return the newest grades first
    });
  }
}
