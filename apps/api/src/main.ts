import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow requests from our frontend
  app.enableCors({
    origin: "http://localhost:3000", // Allow requests from our frontend's address
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
