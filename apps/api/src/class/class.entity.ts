import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "../user/user.entity";


// The Class entity represents a class in the system, which can have multiple students and a teacher.
// It includes properties for the class name and academic year, and establishes a one-to-many relationship
@Entity("classes")
export class Class {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string; // e.g., "Grade 5", "JHS 1 Science"

  @Column()
  academicYear: string; // e.g., "2024/2025"

  // A class can have many users (students and a teacher)
  @OneToMany(() => User, (user) => user.class)
  users: User[];
}
