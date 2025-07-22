import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "../user/user.entity";
import { Class } from "../class/class.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum";

/**
 * Represents an announcement in the system.
 * An announcement can be created by a user and can be approved by another user.
 * It can also be associated with multiple classes.
 */
@Entity("announcements")
export class Announcement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({
    type: "enum",
    enum: AnnouncementStatus,
    default: AnnouncementStatus.PENDING,
  })
  status: AnnouncementStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User)
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { nullable: true })
  approvedBy?: User;

  @Column({ nullable: true })
  approvedById?: string;

  // An announcement can be for multiple classes
  @ManyToMany(() => Class)
  @JoinTable({
    name: "announcement_classes",
    joinColumn: { name: "announcementId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "classId", referencedColumnName: "id" },
  })
  classes: Class[];
}
