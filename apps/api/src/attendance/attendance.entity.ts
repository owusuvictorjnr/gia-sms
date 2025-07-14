import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from "typeorm";
import { User } from "../user/user.entity";
import { AttendanceStatus } from "shared-types/src/attendance-status.enum"; // Import from shared package

@Entity("attendance")
@Unique(["studentId", "date"])
export class Attendance {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: "date" })
  date: string;

  @Column({ nullable: true })
  remarks?: string;

  @ManyToOne(() => User)
  student: User;

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  teacher: User;

  @Column()
  teacherId: string;
}
