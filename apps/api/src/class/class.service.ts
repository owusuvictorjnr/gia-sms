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

    user.classId = classToAssign.id; // Explicitly set the foreign key
    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findStudentsByTeacher(teacherPayload: {
    userId: string;
  }): Promise<User[]> {
    // 1. Fetch the teacher to get their classId
    const teacher = await this.usersRepository.findOneBy({
      id: teacherPayload.userId,
    });

    // 2. Check if the teacher exists and is assigned to a class
    if (!teacher || !teacher.classId) {
      return [];
    }

    // 3. Find all users who are students and are in the same class
    const students = await this.usersRepository.find({
      where: {
        classId: teacher.classId, // Use the direct foreign key for the query
        role: UserRole.STUDENT,
      },
      order: { lastName: "ASC" },
    });

    // 4. Return the students without their sensitive password data
    return students.map(({ password, ...rest }) => rest as User);
  }
}
 