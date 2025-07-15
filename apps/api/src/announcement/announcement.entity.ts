import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../user/user.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum"; // Import from shared package

// This entity represents an announcement in the system
// It includes fields for the announcement's title, content, status, and relationships to the author
// The status can be PENDING, APPROVED, or REJECTED
// The author is the teacher who created the announcement, and it can also be approved by an admin
// The entity is mapped to the "announcements" table in the database
// The status field is an enum with a default value of PENDING
// The createdAt and updatedAt fields are automatically managed by TypeORM
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
  author: User; // The teacher who created the announcement

  @Column()
  authorId: string;

  @ManyToOne(() => User, { nullable: true })
  approvedBy?: User; // The admin who approved it (optional)

  @Column({ nullable: true })
  approvedById?: string;
}
