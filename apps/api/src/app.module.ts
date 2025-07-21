import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { User } from "./user/user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { GradeModule } from "./grade/grade.module";
import { Grade } from "./grade/grade.entity";
import { AttendanceModule } from "./attendance/attendance.module";
import { Attendance } from "./attendance/attendance.entity";
import { ParentModule } from "./parent/parent.module";
import { AdminModule } from "./admin/admin.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { Announcement } from "./announcement/announcement.entity";
import { FinanceModule } from "./finance/finance.module";
import { FeeStructure } from "./finance/feestructure.entity";
import { Invoice } from "./finance/invoice.entity";
import { TransactionModule } from "./transaction/transaction.module";
import { Transaction } from "./transaction/transaction.entity";
import { ClassModule } from "./class/class.module";
import { Class } from "./class/class.entity";
import { TimetableModule } from "./timetable/timetable.module";
import { TimetableEntry } from "./timetable/timetable.entity";
import { CalendarModule } from "./calendar/calendar.module";
import { CalendarEvent } from "./calendar/calendar.entity";
import { MessagingModule } from "./messaging/messaging.module";
import { Conversation } from "./messaging/conversation.entity";
import { Message } from "./messaging/message.entity";
import { HealthModule } from "./health/health.module";
import { HealthRecord } from "./health/health-record.entity";

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
          Class,
          TimetableEntry,
          CalendarEvent,
          Conversation,
          Message,
          HealthRecord,
        ],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    GradeModule,
    AttendanceModule,
    ParentModule,
    AdminModule,
    AnnouncementModule,
    FinanceModule,
    TransactionModule,
    ClassModule,
    TimetableModule,
    CalendarModule,
    MessagingModule, // Imported MessagingModule here
    HealthModule, // Imported HealthModule here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
