import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { User } from "./user/user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    // Load the .env file and make it available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // Use forRootAsync to inject the ConfigService and use the .env variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        // Ensure the password is treated as a string
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [User],
        synchronize: true, // Keep this true for development
      }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
