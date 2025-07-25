import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
import { INestApplication } from '@nestjs/common';

let cachedServer: any;

async function bootstrap(): Promise<INestApplication> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const nestApp = await NestFactory.create(AppModule, adapter);
  nestApp.enableCors();

  await nestApp.init();

  return nestApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const nestApp = await bootstrap();
    cachedServer = nestApp.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
}

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
