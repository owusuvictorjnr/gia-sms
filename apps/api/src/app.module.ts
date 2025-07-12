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
        entities: [User, Grade, Attendance],
        synchronize: true,
      }),
    }),
    UserModule, // Added UserModule
    AuthModule, // Added AuthModule
    GradeModule, // Added GradeModule
    AttendanceModule, // Added AttendanceModule
  ],
  controllers: [], // Removed AppController
  providers: [], // Removed AppService
})
export class AppModule {}
