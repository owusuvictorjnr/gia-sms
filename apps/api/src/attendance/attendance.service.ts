import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Attendance } from "./attendance.entity";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { User } from "../user/user.entity";

/**
 * AttendanceService handles the business logic for attendance records.
 * It allows teachers to create or update attendance records for students.
 */
// It also provides methods to retrieve attendance records for a specific date.
// This service is injected with the Attendance repository to interact with the database.
// The CreateAttendanceDto is used to validate the input data when creating or updating attendance records.
// The User entity is used to associate attendance records with the teacher who took the attendance.

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>
  ) {}

  async createOrUpdate(
    createAttendanceDto: CreateAttendanceDto,
    teacher: any // The user object from the JWT payload
  ): Promise<void> {
    const { date, records } = createAttendanceDto;

    // We process each student's record in the submission
    for (const record of records) {
      // Find if an attendance record already exists for this student on this date
      const existingRecord = await this.attendanceRepository.findOne({
        where: {
          studentId: record.studentId,
          date: date,
        },
      });

      if (existingRecord) {
        // If it exists, update it
        existingRecord.status = record.status;
        existingRecord.teacherId = teacher.userId; // FIX: Use teacher.userId
        await this.attendanceRepository.save(existingRecord);
      } else {
        // If it doesn't exist, create a new one
        const newRecord = this.attendanceRepository.create({
          studentId: record.studentId,
          date: date,
          status: record.status,
          teacherId: teacher.userId, // FIX: Use teacher.userId
        });
        await this.attendanceRepository.save(newRecord);
      }
    }
  }

  async findForDate(date: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { date },
    });
  }
}
