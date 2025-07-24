import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Class } from "./class.entity";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { User, UserRole } from "../user/user.entity";
import { TimetableEntry } from "../timetable/timetable.entity";

/**
 * ClassService handles the business logic for class management,
 * including creating classes, assigning users, setting homeroom teachers,
 * and retrieving classes and rosters for teachers.
 */
@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TimetableEntry)
    private timetableRepository: Repository<TimetableEntry>
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classesRepository.create(createClassDto);
    return this.classesRepository.save(newClass);
  }

  async findAll(): Promise<Class[]> {
    return this.classesRepository.find({
      relations: ["homeroomTeacher"],
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

  async setHomeroomTeacher(classId: string, teacherId: string): Promise<Class> {
    const classToUpdate = await this.classesRepository.findOneBy({
      id: classId,
    });
    const teacher = await this.usersRepository.findOneBy({ id: teacherId });

    if (!classToUpdate || !teacher) {
      throw new NotFoundException("Class or Teacher not found.");
    }
    if (teacher.role !== UserRole.TEACHER) {
      throw new BadRequestException("The selected user is not a teacher.");
    }

    classToUpdate.homeroomTeacherId = teacher.id;
    return this.classesRepository.save(classToUpdate);
  }

  // New method to get the roster for a homeroom teacher
  async findStudentsByHomeroomTeacher(teacherId: string): Promise<User[]> {
    const teacherClass = await this.classesRepository.findOne({
      where: { homeroomTeacherId: teacherId },
    });

    if (!teacherClass) {
      return []; // This teacher is not a homeroom teacher for any class
    }

    const students = await this.usersRepository.find({
      where: {
        classId: teacherClass.id,
        role: UserRole.STUDENT,
      },
      order: { lastName: "ASC" },
    });
    return students.map(({ password, ...rest }) => rest as User);
  }

  // New method to update a class
  async update(
    classId: string,
    updateClassDto: UpdateClassDto
  ): Promise<Class> {
    const classToUpdate = await this.classesRepository.findOneBy({
      id: classId,
    });
    if (!classToUpdate) {
      throw new NotFoundException(`Class with ID "${classId}" not found.`);
    }
    Object.assign(classToUpdate, updateClassDto);
    return this.classesRepository.save(classToUpdate);
  }

  // New method to delete a class
  async remove(classId: string): Promise<{ message: string }> {
    // Check if any users are assigned to this class first
    const userCount = await this.usersRepository.count({ where: { classId } });
    if (userCount > 0) {
      throw new BadRequestException(
        "Cannot delete class. Please re-assign all teachers and students from this class first."
      );
    }

    const result = await this.classesRepository.delete(classId);
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID "${classId}" not found.`);
    }
    return { message: "Class deleted successfully." };
  }

  // New method to find all unique classes a teacher is assigned to via the timetable
  async findClassesForTeacher(teacherId: string): Promise<Class[]> {
    const entries = await this.timetableRepository.find({
      where: { teacherId },
      relations: ["class"],
    });

    // Get unique classes from the timetable entries
    const uniqueClasses = entries.reduce((acc, entry) => {
      if (entry.class && !acc.some((c) => c.id === entry.class.id)) {
        acc.push(entry.class);
      }
      return acc;
    }, [] as Class[]);

    return uniqueClasses;
  }

  async findClassByTeacher(teacherPayload: { userId: string }): Promise<Class> {
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherPayload.userId },
      relations: ["class"],
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
