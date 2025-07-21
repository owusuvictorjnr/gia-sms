import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HealthRecord } from "./health-record.entity";
import { CreateOrUpdateHealthRecordDto } from "./dto/create-or-update-health-record.dto";


/**
 * HealthService provides methods to manage health records of students.
 * It allows creating, updating, and retrieving health records.
 */
@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private healthRecordsRepository: Repository<HealthRecord>
  ) {}

  async findOneByStudentId(studentId: string): Promise<HealthRecord | null> {
    return this.healthRecordsRepository.findOne({
      where: { studentId },
    });
  }

  async createOrUpdate(
    createDto: CreateOrUpdateHealthRecordDto
  ): Promise<HealthRecord> {
    const { studentId, ...recordData } = createDto;

    // Check if a record already exists for this student
    let record = await this.findOneByStudentId(studentId);

    if (record) {
      // If it exists, update it with the new data
      Object.assign(record, recordData);
    } else {
      // If it doesn't exist, create a new one
      record = this.healthRecordsRepository.create({
        studentId,
        ...recordData,
      });
    }

    return this.healthRecordsRepository.save(record);
  }
}
