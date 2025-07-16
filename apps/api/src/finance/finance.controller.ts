import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { CreateFeeStructureDto } from "./dto/create-feestructure.dto";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";


// The FinanceController handles HTTP requests related to financial operations
// It uses the FinanceService to perform operations like creating fee structures and invoices
// It also applies guards to restrict access based on user roles
@Controller("finance")
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // --- Fee Structure Routes ---

  @Post("fee-structures")
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  createFeeStructure(
    @Body(new ValidationPipe()) createFeeStructureDto: CreateFeeStructureDto
  ) {
    return this.financeService.createFeeStructure(createFeeStructureDto);
  }

  @Get("fee-structures")
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  findAllFeeStructures() {
    return this.financeService.findAllFeeStructures();
  }

  // --- Invoice Routes ---

  @Post("invoices")
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  createInvoice(
    @Body(new ValidationPipe()) createInvoiceDto: CreateInvoiceDto
  ) {
    return this.financeService.createInvoice(createInvoiceDto);
  }

  @Get("invoices/student/:studentId")
  findInvoicesForStudent(@Param("studentId") studentId: string) {
    return this.financeService.findInvoicesForStudent(studentId);
  }

  // New endpoint to get all invoices
  @Get("invoices")
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  findAllInvoices() {
    return this.financeService.findAllInvoices();
  }
}
