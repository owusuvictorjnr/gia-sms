import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";


/**
 * Represents a health record for a student.
 * This entity stores medical information such as blood group, allergies,
 * medical conditions, and emergency contact details.
 */
@Entity("health_records")
export class HealthRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  bloodGroup?: string; // e.g., "O+", "A-"

  @Column("text", { nullable: true })
  allergies?: string; // Comma-separated or detailed text

  @Column("text", { nullable: true })
  medicalConditions?: string; // e.g., "Asthma"

  @Column()
  emergencyContactName: string;

  @Column()
  emergencyContactPhone: string;

  @Column()
  emergencyContactRelationship: string; // e.g., "Mother", "Father"

  // --- Relationships ---

  @OneToOne(() => User)
  @JoinColumn()
  student: User;

  @Column()
  studentId: string;
}
