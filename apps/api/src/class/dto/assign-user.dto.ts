import { IsUUID, IsNotEmpty } from "class-validator";


// This DTO is used for assigning a user to a class, ensuring that both userId and classId are valid UUIDs and not empty.
export class AssignUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;
}
