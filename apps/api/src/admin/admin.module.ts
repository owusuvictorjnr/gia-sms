import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";


// AdminModule is responsible for admin-specific functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule, // For JwtAuthGuard
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
