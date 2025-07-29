import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Class } from "./class.entity";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { User, UserRole } from "../user/user.entity";
import { TimetableEntry } from "../timetable/timetable.entity";
import { ClassAssignmentsDto } from "./dto/class-assignments.dto";

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

  /**
   * Basic class deletion - fails if any assignments exist
   */
  async remove(classId: string): Promise<{ message: string }> {
    const assignments = await this.getClassAssignments(classId);

    if (this.hasActiveAssignments(assignments)) {
      throw new BadRequestException(this.getDeletionError(assignments));
    }

    const result = await this.classesRepository.delete(classId);
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID "${classId}" not found.`);
    }
    return { message: "Class deleted successfully." };
  }

  /**
   * Enhanced class deletion with options
   */
  async removeClass(
    classId: string,
    options: {
      moveStudentsTo?: string;
      unassignTeachers?: boolean;
      force?: boolean;
    } = {}
  ): Promise<{ message: string }> {
    const assignments = await this.getClassAssignments(classId);

    if (!options.force) {
      if (
        assignments.teacherIds.length > 0 ||
        assignments.studentIds.length > 0 ||
        assignments.timetableEntriesCount > 0
      ) {
        throw new BadRequestException({
          message: "Class has active assignments",
          assignments,
          instructions: "Use force: true to delete anyway",
        });
      }
    }

    // Handle force deletion
    if (options.force) {
      await this.classesRepository.manager.transaction(async (manager) => {
        // Unassign teachers if requested
        if (options.unassignTeachers && assignments.teacherIds.length > 0) {
          await manager.update(
            User,
            { id: In(assignments.teacherIds) },
            { classId: null }
          );
        }

        // Move students if target class provided
        if (options.moveStudentsTo && assignments.studentIds.length > 0) {
          await manager.update(
            User,
            { id: In(assignments.studentIds) },
            { classId: options.moveStudentsTo }
          );
        } else if (assignments.studentIds.length > 0) {
          // Or unassign them if no target class
          await manager.update(
            User,
            { id: In(assignments.studentIds) },
            { classId: null }
          );
        }

        // Delete timetable entries
        if (assignments.timetableEntriesCount > 0) {
          await manager.delete(TimetableEntry, { classId });
        }

        // Finally delete the class
        await manager.delete(Class, classId);
      });

      return { message: "Class and assignments deleted successfully" };
    }

    // Regular deletion
    const result = await this.classesRepository.delete(classId);
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID "${classId}" not found.`);
    }

    return { message: "Class deleted successfully." };
  }

  private hasActiveAssignments(assignments: ClassAssignmentsDto): boolean {
    return (
      assignments.teacherIds.length > 0 ||
      assignments.studentIds.length > 0 ||
      assignments.parentIds.length > 0 ||
      assignments.timetableEntriesCount > 0
    );
  }

  private getDeletionError(
    assignments: ClassAssignmentsDto,
    options?: any
  ): any {
    return {
      message: "Cannot delete class with active assignments",
      assignments,
      instructions: {
        teachers: options?.unassignTeachers
          ? "Teachers will be unassigned"
          : "Unassign all teachers first or set unassignTeachers: true",
        students: options?.moveStudentsTo
          ? `Students will be moved to class ${options.moveStudentsTo}`
          : "Move all students to another class first or provide moveStudentsTo",
        parents:
          "Parents will be automatically unassigned when their children are moved",
        timetable: "Remove all timetable entries first",
        forceOption:
          "Or use force: true to automatically handle all assignments",
      },
    };
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

  async findClassesForTeacher(teacherId: string): Promise<Class[]> {
    const homeroomClasses = await this.classesRepository.find({
      where: { homeroomTeacherId: teacherId },
    });

    const timetableEntries = await this.timetableRepository.find({
      where: { teacherId },
      relations: ["class"],
    });

    const uniqueClasses = [...homeroomClasses];
    timetableEntries.forEach((entry) => {
      if (entry.class && !uniqueClasses.some((c) => c.id === entry.class.id)) {
        uniqueClasses.push(entry.class);
      }
    });

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

  async findStudentsByHomeroomTeacher(teacherId: string): Promise<User[]> {
    const teacherClass = await this.classesRepository.findOne({
      where: { homeroomTeacherId: teacherId },
    });

    if (!teacherClass) {
      return [];
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

  async getClassUsers(
    classId: string
  ): Promise<{ teachers: User[]; students: User[] }> {
    const users = await this.usersRepository.find({
      where: { classId },
      relations: ["class"],
    });

    return {
      teachers: users.filter((u) => u.role === UserRole.TEACHER),
      students: users.filter((u) => u.role === UserRole.STUDENT),
    };
  }

  async unassignTeacher(teacherId: string): Promise<User> {
    const teacher = await this.usersRepository.findOneBy({ id: teacherId });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }

    teacher.classId = null;
    return this.usersRepository.save(teacher);
  }

  async moveStudents(
    classId: string,
    targetClassId: string
  ): Promise<{ movedCount: number }> {
    const result = await this.usersRepository.update(
      { classId, role: UserRole.STUDENT },
      { classId: targetClassId }
    );

    return { movedCount: result.affected || 0 };
  }

  async getClassAssignments(classId: string): Promise<ClassAssignmentsDto> {
    const classExists = await this.classesRepository.findOneBy({ id: classId });
    if (!classExists) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const [teachers, students] = await Promise.all([
      this.usersRepository.find({
        where: {
          classId,
          role: UserRole.TEACHER,
        },
        select: ["id"],
      }),
      this.usersRepository.find({
        where: {
          classId,
          role: UserRole.STUDENT,
        },
        relations: ["parents"],
        select: ["id"],
      }),
    ]);

    const parentIds = students.flatMap(
      (student) => student.parents?.map((parent) => parent.id) || []
    );

    const timetableEntriesCount = await this.timetableRepository.count({
      where: { classId },
    });

    return {
      teacherIds: teachers.map((t) => t.id),
      studentIds: students.map((s) => s.id),
      parentIds: [...new Set(parentIds)],
      timetableEntriesCount,
    };
  }
}
