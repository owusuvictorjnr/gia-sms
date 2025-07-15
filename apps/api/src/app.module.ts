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
        entities: [User, Grade, Attendance, Announcement],
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
  ],
  controllers: [], 
  providers: [],
})
export class AppModule {}
