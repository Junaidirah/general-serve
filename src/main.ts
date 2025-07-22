import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Konfigurasi lain jika perlu
  app.enableCors();

  if (process.env.VERCEL === '1') {
    // Untuk Vercel
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp;
  } else {
    // Untuk lokal
    await app.listen(3000);
  }
}

bootstrap();
