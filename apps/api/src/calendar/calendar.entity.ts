import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../user/user.entity";

export enum EventType {
  HOLIDAY = "holiday",
  MEETING = "meeting",
  EXAM = "exam",
  SPORTS = "sports",
  OTHER = "other",
}


/**
 * CalendarEvent represents an event in the school calendar.
 * It can be a holiday, meeting, exam, sports event, or any other type of event.
 */
@Entity("calendar_events")
export class CalendarEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string; // e.g., "P.T.A. Meeting", "Mid-Term Exams"

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "date" })
  startDate: string; // "YYYY-MM-DD"

  @Column({ type: "date" })
  endDate: string; // "YYYY-MM-DD"

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.OTHER,
  })
  type: EventType;

  @CreateDateColumn()
  createdAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User)
  createdBy: User; // The admin who created the event

  @Column()
  createdById: string;
}
