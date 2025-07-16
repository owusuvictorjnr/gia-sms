import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

/**
 * Represents a fee structure in the system.
 * Each fee structure is associated with a specific academic year and has a unique name.
 */
@Entity("fee_structures")
@Unique(["name", "academicYear"])
export class FeeStructure {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string; // e.g., "Term 1 School Fees", "Bus Fees"

  @Column()
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column()
  academicYear: string; // e.g., "2024/2025"
}
