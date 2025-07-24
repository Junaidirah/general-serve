import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [MachinesController],
  providers: [MachinesService, PrismaService],
  exports: [MachinesService],
})
export class MachinesModule {}
