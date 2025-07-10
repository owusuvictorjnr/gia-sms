import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// This enum defines the possible roles a user can have.
export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  PARENT = "parent",
  ACCOUNTANT = "accountant",
  STUDENT = "student",
}

@Entity("users") // This decorator marks the class as a database table named 'users'.
export class User {
  @PrimaryGeneratedColumn("uuid") // Creates a primary key column that auto-generates a unique ID.
  id: string;

  @Column({ unique: true }) // Creates a column for the email, which must be unique.
  email: string;

  @Column() // Creates a column for the hashed password.
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.PARENT, // Sets the default role for new users to 'parent'.
  })
  role: UserRole;

  @Column()
  firstName: string;

  @Column({ nullable: true }) // Middle name is optional, so it can be null.
  middleName: string;

  @Column()
  lastName: string;
}
