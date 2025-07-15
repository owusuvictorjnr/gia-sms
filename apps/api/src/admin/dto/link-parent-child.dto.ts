import { IsUUID, IsNotEmpty } from "class-validator";

// This DTO is used to validate the input for linking a parent to a child in the admin service.
export class LinkParentChildDto {
  @IsUUID()
  @IsNotEmpty()
  parentId: string;

  @IsUUID()
  @IsNotEmpty()
  childId: string;
}
