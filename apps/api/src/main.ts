import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

try {
  process.loadEnvFile();
} catch (err) {
  console.log('No env file', err)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Allow the Angular dev server to call this API from the browser.
  app.enableCors({ origin: 'http://localhost:4200' })
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
