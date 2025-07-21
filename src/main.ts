import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Modifikasi untuk Vercel:
// Jangan panggil app.listen().
// Cukup inisialisasi aplikasi dan ekspor sebagai modul.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tambahkan konfigurasi lain di sini jika perlu
  // Contoh: app.enableCors();

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp;
}

// Ekspor fungsi bootstrap yang akan dipanggil oleh Vercel
export default bootstrap();
