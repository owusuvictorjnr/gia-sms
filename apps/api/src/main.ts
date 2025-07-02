import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // We will add more configuration here later (e.g., CORS, validation pipes)
  await app.listen(3001); // The backend will run on port 3001
}
bootstrap();