import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the Angular dev server to call this API from the browser.
  app.enableCors('http://localhost:4200')
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
