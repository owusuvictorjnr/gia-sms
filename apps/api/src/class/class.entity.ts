import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { User } from "../user/user.entity";


/**
 * Represents a class in the system.
 * A class can have many users (students and subject teachers) and one homeroom teacher.
 */
@Entity("classes")
export class Class {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  academicYear: string;

  // A class can have many users (students and subject teachers)
  @OneToMany(() => User, (user) => user.class)
  users: User[];

  // A class has only ONE homeroom teacher
  @ManyToOne(() => User, { nullable: true })
  homeroomTeacher: User;

  @Column({ nullable: true })
  homeroomTeacherId?: string;
}
