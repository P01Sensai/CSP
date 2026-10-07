import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Needed since our frontend runs on a different port (Tauri dev server)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
