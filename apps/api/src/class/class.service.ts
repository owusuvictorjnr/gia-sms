import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Class } from "./class.entity";
import { CreateClassDto } from "./dto/create-class.dto";
import { User, UserRole } from "../user/user.entity";

// The ClassService is responsible for managing class-related operations such as creating classes, assigning users to classes, and fetching class rosters for teachers.

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classesRepository.create(createClassDto);
    return this.classesRepository.save(newClass);
  }

  async findAll(): Promise<Class[]> {
    return this.classesRepository.find({
      order: { academicYear: "DESC", name: "ASC" },
    });
  }

  async assignUserToClass(userId: string, classId: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const classToAssign = await this.classesRepository.findOneBy({
      id: classId,
    });

    if (!user || !classToAssign) {
      throw new NotFoundException("User or Class not found.");
    }

    user.classId = classToAssign.id;
    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result as User;
  }

  // New method to get the teacher's assigned class
  async findClassByTeacher(teacherPayload: { userId: string }): Promise<Class> {
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherPayload.userId },
      relations: ["class"], // Load the related class
    });

    if (!teacher || !teacher.class) {
      throw new NotFoundException("Teacher is not assigned to a class.");
    }
    return teacher.class;
  }

  async findStudentsByTeacher(teacherPayload: {
    userId: string;
  }): Promise<User[]> {
    const teacher = await this.usersRepository.findOneBy({
      id: teacherPayload.userId,
    });

    if (!teacher || !teacher.classId) {
      return [];
    }

    const students = await this.usersRepository.find({
      where: {
        classId: teacher.classId,
        role: UserRole.STUDENT,
      },
      order: { lastName: "ASC" },
    });

    return students.map(({ password, ...rest }) => rest as User);
  }
}
