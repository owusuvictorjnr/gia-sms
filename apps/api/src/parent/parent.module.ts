import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { ParentController } from "./parent.controller";
import { ParentService } from "./parent.service";
import { AuthModule } from "../auth/auth.module";


// The ParentModule is responsible for managing parent-related functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // We need the User repository to find parents/children
    AuthModule, // We need this for the JwtAuthGuard
  ],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
