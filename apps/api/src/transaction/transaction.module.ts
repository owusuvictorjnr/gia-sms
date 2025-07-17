import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./transaction.entity";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { Invoice } from "../finance/invoice.entity";
import { AuthModule } from "../auth/auth.module";

// The TransactionModule is responsible for handling transactions.
// It imports the TypeOrmModule for the Transaction and Invoice entities,
// and provides the TransactionService and TransactionController.
// The AuthModule is imported to use the JwtAuthGuard for protecting routes.
// This module allows for initiating transactions, which involves creating a record in the database
// and simulating a payment gateway response.
@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Invoice]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [TransactionService],
  exports: [TransactionService],
  controllers: [TransactionController], // Register the TransactionController
})
export class TransactionModule {}
