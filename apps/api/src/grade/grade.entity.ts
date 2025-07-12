import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity("grades")
export class Grade {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  assessment: string; // e.g., "Math Test 1", "English Essay"

  @Column()
  score: string; // e.g., "85%", "A-"

  @Column()
  subject: string; // e.g., "Mathematics", "Science"

  @CreateDateColumn()
  date: Date;

  // --- Relationships ---

  @ManyToOne(() => User)
  student: User; // The student who received the grade

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  teacher: User; // The teacher who entered the grade

  @Column()
  teacherId: string;
}
