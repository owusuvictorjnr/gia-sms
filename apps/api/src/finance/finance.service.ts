import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FeeStructure } from "./feestructure.entity";
import { Invoice, InvoiceStatus } from "./invoice.entity";
import { CreateFeeStructureDto } from "./dto/create-feestructure.dto";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";


// FinanceService handles the business logic for financial operations such as fee structures and invoices
@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FeeStructure)
    private feeStructuresRepository: Repository<FeeStructure>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>
  ) {}

  // --- Fee Structure Management ---
  async createFeeStructure(
    createFeeStructureDto: CreateFeeStructureDto
  ): Promise<FeeStructure> {
    const newFeeStructure = this.feeStructuresRepository.create(
      createFeeStructureDto
    );
    return this.feeStructuresRepository.save(newFeeStructure);
  }

  async findAllFeeStructures(): Promise<FeeStructure[]> {
    return this.feeStructuresRepository.find();
  }

  // --- Invoice Management ---
  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const newInvoice = this.invoicesRepository.create({
      ...createInvoiceDto,
      status: InvoiceStatus.UNPAID,
    });
    return this.invoicesRepository.save(newInvoice);
  }

  async findInvoicesForStudent(studentId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { studentId },
      relations: ["feeStructure"],
      order: { dueDate: "ASC" },
    });
  }

  // New method to find all invoices
  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      relations: ["student", "feeStructure"], // Include related student and fee structure data
      order: { issuedAt: "DESC" }, // Show the most recently issued invoices first
    });
  }
}
