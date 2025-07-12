import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from "typeorm";
import { User } from "../user/user.entity";

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
}


@Entity("attendance")
// This ensures that there can only be one attendance record per student per day.
@Unique(["studentId", "date"])
export class Attendance {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: "date" }) // Stores only the date, without time.
  date: string; // e.g., "2025-07-11"

  @Column({ nullable: true })
  remarks?: string; // Optional notes from the teacher

  // --- Relationships ---

  @ManyToOne(() => User)
  student: User;

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  teacher: User; // The teacher who took the attendance

  @Column()
  teacherId: string;
}
