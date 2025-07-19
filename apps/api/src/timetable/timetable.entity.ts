import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Class } from "../class/class.entity";
import { User } from "../user/user.entity";

export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
}


// This entity represents a timetable entry for a class, including the day of the week, start and end times, subject, and the teacher responsible for that entry.
@Entity("timetable_entries")
export class TimetableEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: "time" }) // Stores time, e.g., '08:30:00'
  startTime: string;

  @Column({ type: "time" })
  endTime: string;

  @Column()
  subject: string;

  // --- Relationships ---

  @ManyToOne(() => Class)
  class: Class;

  @Column()
  classId: string;

  @ManyToOne(() => User)
  teacher: User; // The teacher for this specific subject/period

  @Column()
  teacherId: string;
}
