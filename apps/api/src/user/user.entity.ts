import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  PARENT = "parent",
  ACCOUNTANT = "accountant",
  STUDENT = "student",
}

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

  // For a parent, this will list their children.
  // For a student, this will be empty.
  @ManyToMany(() => User, (user) => user.parents)
  @JoinTable({
    name: "parent_child", // The name of the intermediate table
    joinColumn: { name: "parentId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "childId", referencedColumnName: "id" },
  })
  children: User[];

  // For a student, this will list their parents.
  // For a parent, this will be empty.
  @ManyToMany(() => User, (user) => user.children)
  parents: User[];
}
