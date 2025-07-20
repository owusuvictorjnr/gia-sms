import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { EventType } from "../calendar.entity";


/**
 * CreateCalendarEventDto is used to create a new calendar event.
 * It includes validation rules for the properties.
 */
export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // Expecting "YYYY-MM-DD"

  @IsString()
  @IsNotEmpty()
  endDate: string; // Expecting "YYYY-MM-DD"

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;
}
