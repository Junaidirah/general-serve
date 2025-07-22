import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Untuk development
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}

// Untuk Vercel
const server = express();
const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors();
  await app.init();
  return app;
};

// Export untuk Vercel
if (process.env.VERCEL) {
  createNestServer(server);
  module.exports = server;
} else {
  // Jalankan normal untuk development
  bootstrap();
}

// Export default untuk Vercel
export default server;
