import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLoadReadingDto } from './dto/create-load-reading.dto';
import { PlantType } from '@prisma/client';

@Injectable()
export class LoadReadingService {
  constructor(private prisma: PrismaService) {}

  async createLoadReadingByMachineId(
    machineId: string,
    createLoadReadingDto: CreateLoadReadingDto,
  ) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      include: { plant: true },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const surplus = await this.calculateSurplus(
      machine.plant.type,
      createLoadReadingDto.dmSiang,
      createLoadReadingDto.dmMalam,
      createLoadReadingDto.timestamp,
    );

    const loadReading = await this.prisma.loadReading.create({
      data: {
        machineId,
        timestamp: createLoadReadingDto.timestamp,
        load: createLoadReadingDto.load,
        avgLoad: createLoadReadingDto.avgLoad,
        maxLoad: createLoadReadingDto.maxLoad,
        minLoad: createLoadReadingDto.minLoad,
        dmSiang: createLoadReadingDto.dmSiang,
        dmMalam: createLoadReadingDto.dmMalam,
        dmMesin: this.getDmMesin(
          createLoadReadingDto.dmSiang,
          createLoadReadingDto.dmMalam,
          createLoadReadingDto.timestamp,
        ),
        surplus,
        status: createLoadReadingDto.status,
        createdAt: new Date(),
      },
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
    });

    return loadReading;
  }

  async getLoadReadingByPlantType(plantType: PlantType) {
    const loadReadings = await this.prisma.loadReading.findMany({
      where: {
        machine: {
          plant: {
            type: plantType,
          },
        },
      },
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const aggregatedData = await this.getAggregatedDataByPlantType(plantType);

    return {
      loadReadings,
      aggregatedData,
    };
  }

  private async calculateSurplus(
    plantType: PlantType,
    dmSiang?: number | null,
    dmMalam?: number | null,
    timestamp?: Date,
  ): Promise<number> {
    const avgPerPlantType = await this.getAvgPerPlantType(plantType);
    const dmMesin = this.getDmMesin(dmSiang, dmMalam, timestamp);
    return avgPerPlantType - dmMesin;
  }

  private async getAvgPerPlantType(plantType: PlantType): Promise<number> {
    const result = await this.prisma.loadReading.aggregate({
      where: {
        machine: {
          plant: {
            type: plantType,
          },
        },
      },
      _sum: {
        load: true,
      },
      _count: {
        id: true,
      },
    });

    if (!result._count.id || result._count.id === 0) {
      return 0;
    }

    return (result._sum.load || 0) / result._count.id;
  }

  private getDmMesin(
    dmSiang?: number | null,
    dmMalam?: number | null,
    timestamp?: Date | string,
  ): number {
    if (!timestamp) {
      timestamp = new Date();
    } else if (!(timestamp instanceof Date)) {
      timestamp = new Date(timestamp);
    }

    const hour = timestamp.getHours();
    const isNight = hour >= 18 || hour < 6;

    return isNight ? dmMalam || 0 : dmSiang || 0;
  }

  private async getAggregatedDataByPlantType(plantType: PlantType) {
    const now = new Date();
    const isNight = now.getHours() >= 18 || now.getHours() < 6;

    const dmSum = await this.prisma.loadReading.aggregate({
      where: {
        machine: {
          plant: {
            type: plantType,
          },
        },
      },
      _sum: {
        ...(!isNight && { dmSiang: true }),
        ...(isNight && { dmMalam: true }),
      },
    });

    const totalSum = await this.prisma.loadReading.aggregate({
      where: {
        machine: {
          plant: {
            type: plantType,
          },
        },
      },
      _sum: {
        load: true,
      },
      _count: {
        id: true,
      },
    });

    const avgPerPlantType =
      totalSum._count.id > 0
        ? (totalSum._sum.load || 0) / totalSum._count.id
        : 0;

    const dmMesinSum = isNight
      ? dmSum?._sum?.dmMalam || 0
      : dmSum?._sum?.dmSiang || 0;

    return {
      plantType,
      avgPerPlantType,
      dmMesinSum,
      surplus: avgPerPlantType - dmMesinSum,
      isNightTime: isNight,
      totalReadings: totalSum._count.id,
    };
  }

  async getAllLoadReadings() {
    return this.prisma.loadReading.findMany({
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getLoadReadingById(id: number) {
    const loadReading = await this.prisma.loadReading.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
    });

    if (!loadReading) {
      throw new NotFoundException('Load reading not found');
    }

    return loadReading;
  }

  async updateLoadReading(
    id: number,
    updateData: Partial<CreateLoadReadingDto>,
  ) {
    const existingLoadReading = await this.getLoadReadingById(id);
    let surplus = existingLoadReading.surplus;

    if (updateData.dmSiang !== undefined || updateData.dmMalam !== undefined) {
      const machine = await this.prisma.machine.findUnique({
        where: { id: existingLoadReading.machineId },
        include: { plant: true },
      });

      if (machine) {
        surplus = await this.calculateSurplus(
          machine.plant.type,
          updateData.dmSiang ?? existingLoadReading.dmSiang,
          updateData.dmMalam ?? existingLoadReading.dmMalam,
          updateData.timestamp ?? existingLoadReading.timestamp,
        );
      }
    }

    return this.prisma.loadReading.update({
      where: { id },
      data: {
        ...updateData,
        surplus,
        dmMesin: this.getDmMesin(
          updateData.dmSiang ?? existingLoadReading.dmSiang,
          updateData.dmMalam ?? existingLoadReading.dmMalam,
          updateData.timestamp ?? existingLoadReading.timestamp,
        ),
      },
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
    });
  }

  async deleteLoadReading(id: number) {
    await this.getLoadReadingById(id);
    return this.prisma.loadReading.delete({ where: { id } });
  }
}
