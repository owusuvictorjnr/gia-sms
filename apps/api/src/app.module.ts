import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { GradeModule } from "./grade/grade.module";
import { User } from "./user/user.entity";
import { Grade } from "./grade/grade.entity";
import { AttendanceModule } from "./attendance/attendance.module";
import { Attendance } from "./attendance/attendance.entity";
import { ParentModule } from "./parent/parent.module";
import { AdminModule } from "./admin/admin.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { Announcement } from "./announcement/announcement.entity";
import { FinanceModule } from "./finance/finance.module";
import { Invoice } from "./finance/invoice.entity";
import { FeeStructure } from "./finance/feestructure.entity";
import { TransactionModule } from "./transaction/transaction.module";
import { Transaction } from "./transaction/transaction.entity";
import { ClassModule } from "./class/class.module";
import { Class } from "./class/class.entity";
import { TimetableModule } from "./timetable/timetable.module";
import { TimetableEntry } from "./timetable/timetable.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [
          User,
          Grade,
          Attendance,
          Announcement,
          FeeStructure,
          Invoice,
          Transaction,
          Class, // Added Class entity
          TimetableEntry, // Added TimetableEntry entity
        ],
        synchronize: true,
      }),
    }),
    UserModule, // Added UserModule
    AuthModule, // Added AuthModule
    GradeModule, // Added GradeModule
    AttendanceModule, // Added AttendanceModule
    ParentModule, // Added ParentModule
    AdminModule, // Added AdminModule
    AnnouncementModule, // Added AnnouncementModule
    FinanceModule, // Added FinanceModule
    TransactionModule, // Added TransactionModule
    ClassModule, // Added ClassModule
    TimetableModule, // Imported TimetableModule here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
