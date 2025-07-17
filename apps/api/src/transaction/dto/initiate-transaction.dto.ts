import { IsString, IsNotEmpty, IsUUID } from "class-validator";

// This DTO is used to initiate a transaction by providing the invoice ID.
export class InitiateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;
}
