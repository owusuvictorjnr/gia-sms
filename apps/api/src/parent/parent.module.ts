import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { ParentController } from "./parent.controller";
import { ParentService } from "./parent.service";
import { AuthModule } from "../auth/auth.module";
import { GradeModule } from "src/grade/grade.module";
import { AttendanceModule } from "src/attendance/attendance.module";


// The ParentModule is responsible for managing parent-related functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // We need the User repository to find parents/children
    AuthModule, // We need this for the JwtAuthGuard
     GradeModule, // Import GradeModule to use GradeService
    AttendanceModule, // Import AttendanceModule to use AttendanceService
  ],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
