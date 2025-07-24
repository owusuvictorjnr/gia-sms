import { IsUUID, IsNotEmpty } from 'class-validator';

export class PromoteStudentsDto {
  @IsUUID()
  @IsNotEmpty()
  fromClassId: string;

  @IsUUID()
  @IsNotEmpty()
  toClassId: string;
}
