import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthRecord } from "./health-record.entity";
import { HealthService } from "./health.service";
import { HealthController } from "./health.controller";
import { AuthModule } from "../auth/auth.module";


/**
 * HealthModule is responsible for managing health records of students.
 * It provides endpoints to create, update, and retrieve health records.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([HealthRecord]),
    AuthModule, // Import AuthModule to use the JwtAuthGuard
  ],
  providers: [HealthService],
  exports: [HealthService],
  controllers: [HealthController], // Register the HealthController
})
export class HealthModule {}
