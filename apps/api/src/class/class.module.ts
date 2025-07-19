import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Class } from "./class.entity";
import { ClassService } from "./class.service";
import { User } from "../user/user.entity";
import { ClassController } from "./class.controller";
import { AuthModule } from "../auth/auth.module";


// The ClassModule is responsible for managing class-related operations such as creating classes, assigning users to classes, and fetching class rosters for teachers.
// It imports the necessary TypeORM modules for Class and User entities, and registers the ClassService
@Module({
  imports: [
    TypeOrmModule.forFeature([Class, User]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [ClassService],
  exports: [ClassService],
  controllers: [ClassController], // Register the ClassController
})
export class ClassModule {}
