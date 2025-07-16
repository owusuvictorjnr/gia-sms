import { IsString, IsNotEmpty, IsNumber, IsPositive } from "class-validator";


// This DTO is used to create a fee structure in the finance module
export class CreateFeeStructureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  academicYear: string;
}
