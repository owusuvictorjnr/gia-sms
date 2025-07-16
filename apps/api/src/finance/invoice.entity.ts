import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { FeeStructure } from './feestructure.entity';

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

// Represents an invoice in the finance module
// Each invoice is associated with a student and a fee structure
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.UNPAID,
  })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  dueDate: string;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ type: 'date', nullable: true })
  paidAt?: string;

  // --- Relationships ---

  @ManyToOne(() => User)
  student: User; // The student this invoice is for

  @Column()
  studentId: string;

  @ManyToOne(() => FeeStructure)
  feeStructure: FeeStructure; // The fee item this invoice is based on

  @Column()
  feeStructureId: string;
}
