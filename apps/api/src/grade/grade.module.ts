import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Grade } from "./grade.entity";
import { GradeService } from "./grade.service";

// The GradeModule is responsible for managing grades in the application.
@Module({
  imports: [TypeOrmModule.forFeature([Grade])],
  providers: [GradeService], // We've added the GradeService here
  exports: [GradeService], // Also exporting it for other modules to use if needed
  controllers: [], // We will add GradeController here soon
})
export class GradeModule {}
