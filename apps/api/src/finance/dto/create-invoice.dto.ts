import { IsString, IsNotEmpty, IsUUID } from 'class-validator';


// This DTO is used to create an invoice in the finance module
export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()

  feeStructureId: string;

  @IsString()
  @IsNotEmpty()
  dueDate: string; // Expecting date in "YYYY-MM-DD" format
}
