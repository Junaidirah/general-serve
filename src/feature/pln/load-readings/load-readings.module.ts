import { Module } from '@nestjs/common';
import { LoadReadingController } from './load-readings.controller';
import { LoadReadingsService } from './load-readings.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [LoadReadingController],
  providers: [LoadReadingsService, PrismaService],
})
export class LoadReadingsModule {}
