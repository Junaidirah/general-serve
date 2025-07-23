import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { INestApplication } from '@nestjs/common';

// Variabel untuk menyimpan cache instance server di lingkungan serverless
let cachedServer: any;

// Fungsi untuk membuat dan menginisialisasi aplikasi NestJS
async function bootstrap(): Promise<INestApplication> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors();

  // Inisialisasi aplikasi tanpa memulai listener
  await app.init();
  return app;
}

// Handler utama yang akan diekspor untuk Vercel
export default async function handler(req: any, res: any) {
  // Gunakan server dari cache jika sudah ada untuk performa
  if (!cachedServer) {
    const nestApp = await bootstrap();
    cachedServer = nestApp.getHttpAdapter().getInstance();
  }

  // Teruskan permintaan ke handler NestJS
  return cachedServer(req, res);
}

// Jalankan server secara normal hanya jika tidak di lingkungan Vercel
if (process.env.VERCEL !== '1') {
  async function startLocal() {
    const app = await bootstrap();
    await app.listen(process.env.PORT || 3000);
    console.log(
      `🚀 Server listening at http://localhost:${process.env.PORT || 3000}`,
    );
  }
  startLocal();
}
