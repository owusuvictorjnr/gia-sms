import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../user/user.entity";
import { Invoice } from "../finance/invoice.entity";

/**
 * Represents the status of a transaction.
 * - PENDING: The transaction is initiated but not yet completed.
 * - SUCCESSFUL: The transaction has been completed successfully.
 * - FAILED: The transaction has failed.
 */
export enum TransactionStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  FAILED = "failed",
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column()
  reference: string; // The unique reference from the payment gateway (e.g., Paystack)

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  gateway: string; // e.g., "paystack"

  @CreateDateColumn()
  createdAt: Date;

  // --- Relationships ---

  @ManyToOne(() => Invoice)
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @ManyToOne(() => User)
  paidBy: User; // The parent who made the payment

  @Column()
  paidById: string;
}
