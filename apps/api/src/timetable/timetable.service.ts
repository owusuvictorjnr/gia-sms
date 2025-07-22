import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TimetableEntry } from "./timetable.entity";
import { CreateTimetableEntryDto } from "./dto/create-timetable-entry.dto";


/**
 * TimetableService handles the business logic for timetable management,
 * including creating timetable entries and retrieving schedules for classes and teachers.
 */
@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntry)
    private timetableRepository: Repository<TimetableEntry>
  ) {}

  async create(createDto: CreateTimetableEntryDto): Promise<TimetableEntry> {
    const newEntry = this.timetableRepository.create(createDto);
    return this.timetableRepository.save(newEntry);
  }

  async findForClass(classId: string): Promise<TimetableEntry[]> {
    return this.timetableRepository.find({
      where: { classId },
      relations: ["teacher"],
      order: { startTime: "ASC" },
    });
  }

  // New method to find the schedule for a specific teacher
  async findForTeacher(teacherId: string): Promise<TimetableEntry[]> {
    return this.timetableRepository.find({
      where: { teacherId },
      relations: ["class"], // Include class details in the response
      order: { dayOfWeek: "ASC", startTime: "ASC" },
    });
  }
}
