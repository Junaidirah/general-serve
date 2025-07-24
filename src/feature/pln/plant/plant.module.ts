import { Module } from '@nestjs/common';
import { PlantsService } from '../plant/plant.service';
import { PlantsController } from '../plant/plant.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [PlantsController],
  providers: [PlantsService, PrismaService],
  exports: [PlantsService],
})
export class PlantsModule {}
