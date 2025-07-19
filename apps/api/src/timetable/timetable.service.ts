import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TimetableEntry } from "./timetable.entity";
import { CreateTimetableEntryDto } from "./dto/create-timetable-entry.dto";


// The TimetableService is responsible for managing timetable entries, including creating and retrieving them for specific classes.
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
      relations: ["teacher"], // Include teacher details
      order: { startTime: "ASC" },
    });
  }
}
