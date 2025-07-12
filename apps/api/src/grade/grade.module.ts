import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Grade } from "./grade.entity";
import { GradeService } from "./grade.service";
import { GradeController } from "./grade.controller";
import { AuthModule } from "src/auth/auth.module";

// The GradeModule is responsible for managing grades in the application.
@Module({
  imports: [TypeOrmModule.forFeature([Grade]), AuthModule], // Import AuthModule to use the JwtAuthGuard
  providers: [GradeService], // We've added the GradeService here
  exports: [GradeService], // Also exporting it for other modules to use if needed
  controllers: [GradeController], // Register the GradeController
})
export class GradeModule {}
