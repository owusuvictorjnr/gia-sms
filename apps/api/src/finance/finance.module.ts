import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeeStructure } from "./feestructure.entity";
import { Invoice } from "./invoice.entity";
import { FinanceService } from "./finance.service";
import { FinanceController } from "./finance.controller";
import { AuthModule } from "../auth/auth.module";

// The FinanceModule is responsible for managing financial operations such as fee structures and invoices
// It imports TypeOrmModule to interact with the database entities FeeStructure and Invoice
// The FinanceService provides methods to create and retrieve fee structures and invoices
@Module({
  imports: [
    TypeOrmModule.forFeature([FeeStructure, Invoice]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard and RolesGuard
  ],
  providers: [FinanceService], // Register FinanceService as a provider
  exports: [FinanceService], // Export FinanceService for use in other modules
  controllers: [FinanceController], // Register the FinanceController
})
export class FinanceModule {}
