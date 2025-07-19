import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimetableEntry } from "./timetable.entity";
import { TimetableService } from "./timetable.service";
import { TimetableController } from "./timetable.controller";
import { AuthModule } from "../auth/auth.module";


// The TimetableModule is responsible for managing timetable entries, including creating and retrieving them for specific classes.
@Module({
  imports: [
    TypeOrmModule.forFeature([TimetableEntry]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [TimetableService],
  exports: [TimetableService],
  controllers: [TimetableController], // Register the TimetableController
})
export class TimetableModule {}
