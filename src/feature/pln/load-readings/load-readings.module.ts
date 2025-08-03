import { Module } from '@nestjs/common';
import { LoadReadingController } from './load-readings.controller';
import { LoadReadingService } from './load-readings.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [LoadReadingController],
  providers: [LoadReadingService, PrismaService],
})
export class LoadReadingsModule {}
