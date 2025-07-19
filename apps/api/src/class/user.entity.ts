import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";
import { Class } from "../class/class.entity"; // Import the Class entity

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  PARENT = "parent",
  ACCOUNTANT = "accountant",
  STUDENT = "student",
}


// The User entity represents a user in the system, which can be a student, teacher, parent, or admin.
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.PARENT,
  })
  role: UserRole;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column()
  lastName: string;

  // --- Relationships ---

  @ManyToMany(() => User, (user) => user.parents)
  @JoinTable({
    name: "parent_child",
    joinColumn: { name: "parentId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "childId", referencedColumnName: "id" },
  })
  children: User[];

  @ManyToMany(() => User, (user) => user.children)
  parents: User[];

  // A user (student or teacher) can belong to one class
  @ManyToOne(() => Class, (cls) => cls.users, { nullable: true })
  class: Class;

  @Column({ nullable: true })
  classId?: string;
}
