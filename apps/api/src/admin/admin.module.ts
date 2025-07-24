import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";
import { Announcement } from "../announcement/announcement.entity";
import { Transaction } from "../transaction/transaction.entity";
import { Invoice } from "../finance/invoice.entity";
import { Class } from "../class/class.entity";

@Module({
  imports: [
    // Add Invoice to the list of entities for this module
    TypeOrmModule.forFeature([User, Announcement, Transaction, Invoice, Class]), // Add Class repository
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
