import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLoadReadingDto } from './dto/create-load-reading.dto';
import { PlantType } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class LoadReadingsService {
  constructor(private prisma: PrismaService) {}

  // Fungsi ini sekarang menangani 'UPSERT' (Update or Insert)
  async createLoadReadingByMachineId(
    machineId: string,
    createLoadReadingDto: CreateLoadReadingDto,
  ) {
    // 1. Periksa apakah mesin ada
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      include: { plant: true },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    const { timestamp } = createLoadReadingDto;

    // 2. Periksa apakah sudah ada data untuk kombinasi machineId dan timestamp ini
    //    Ini membutuhkan '@@unique([machineId, timestamp])' di schema.prisma Anda
    const existingReading = await this.prisma.loadReading.findUnique({
      where: {
        machineId_timestamp: {
          machineId,
          timestamp,
        },
      },
    });

    const date = new Date(timestamp);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // 3. Logika untuk menghitung min/max.
    // Kita perlu data yang ada hari ini (tidak termasuk data yang sedang diupdate jika ada)
    const otherReadingsToday = await this.prisma.loadReading.findMany({
      where: {
        machineId,
        timestamp: { gte: dayStart, lte: dayEnd },
        NOT: {
          // Abaikan data yang sudah ada dengan timestamp yang sama
          id: existingReading?.id,
        },
      },
      select: { load: true },
    });
    const otherLoads = otherReadingsToday.map((r) => r.load);
    const allLoadsForToday = [...otherLoads, createLoadReadingDto.load];
    const newMaxLoad = Math.max(...allLoadsForToday);
    const newMinLoad = Math.min(...allLoadsForToday);

    // 4. Logika untuk menghitung avgLoad dan surplus (tetap sama)
    const aggregate = await this.prisma.loadReading.aggregate({
      where: {
        machine: { plant: { type: machine.plant.type } },
        timestamp: { gte: dayStart, lte: dayEnd },
        NOT: { id: existingReading?.id },
      },
      _sum: { load: true },
      _count: { id: true },
    });
    const totalOtherLoads = aggregate._sum.load ?? 0;
    const countOtherLoads = aggregate._count.id ?? 0;
    const avgLoad =
      (totalOtherLoads + createLoadReadingDto.load) / (countOtherLoads + 1);

    const dmMesin = this.getDmMesin(
      createLoadReadingDto.dmSiang,
      createLoadReadingDto.dmMalam,
      timestamp,
    );
    const surplus = dmMesin - avgLoad;

    // Data yang akan dibuat atau diupdate
    const dataPayload = {
      machineId,
      timestamp,
      load: createLoadReadingDto.load,
      avgLoad,
      maxLoad: newMaxLoad,
      minLoad: newMinLoad,
      dmSiang: createLoadReadingDto.dmSiang,
      dmMalam: createLoadReadingDto.dmMalam,
      dmMesin,
      surplus,
      status: createLoadReadingDto.status,
    };

    // 5. Lakukan transaksi: Update/Create + UpdateMany untuk min/max
    return this.prisma.$transaction(async (tx) => {
      let result;
      if (existingReading) {
        // JIKA SUDAH ADA: Lakukan UPDATE
        result = await tx.loadReading.update({
          where: { id: existingReading.id },
          data: { ...dataPayload, createdAt: existingReading.createdAt }, // createdAt tidak diubah
          include: { machine: { include: { plant: true } } },
        });
      } else {
        // JIKA BELUM ADA: Lakukan CREATE
        result = await tx.loadReading.create({
          data: { ...dataPayload, createdAt: new Date() },
          include: { machine: { include: { plant: true } } },
        });
      }

      // Update min/max untuk semua data lain di hari yang sama
      await tx.loadReading.updateMany({
        where: {
          machineId,
          timestamp: { gte: dayStart, lte: dayEnd },
        },
        data: {
          maxLoad: newMaxLoad,
          minLoad: newMinLoad,
        },
      });

      return result;
    });
  }

  // ... Sisa file (getLoadReadingByPlantType, dll.) tetap sama ...
  // ... Saya sertakan di bawah untuk kelengkapan ...
  async getLoadReadingByPlantType(plantType: PlantType) {
    const { startOfDay, endOfDay } = this.getTodayDateRange();

    const loadReadings = await this.prisma.loadReading.findMany({
      where: {
        machine: {
          plant: {
            type: plantType,
          },
        },
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        machine: {
          include: {
            plant: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const aggregatedData = this.getAggregatedDataByLoadReadings(loadReadings);

    return {
      loadReadings,
      aggregatedData,
    };
  }

  async getAllLoadReadings() {
    const { startOfDay, endOfDay } = this.getTodayDateRange();
    return this.prisma.loadReading.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        machine: {
          include: {
            plant: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
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
            plant: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
    if (!loadReading) {
      throw new NotFoundException(`Load reading with ID ${id} not found`);
    }
    return loadReading;
  }

  async updateLoadReading(
    id: number,
    updateData: Partial<CreateLoadReadingDto>,
  ) {
    const existingLoadReading = await this.getLoadReadingById(id);

    const newDmSiang = updateData.dmSiang ?? existingLoadReading.dmSiang;
    const newDmMalam = updateData.dmMalam ?? existingLoadReading.dmMalam;
    const newTimestamp = updateData.timestamp ?? existingLoadReading.timestamp;

    const dmMesin = this.getDmMesin(newDmSiang, newDmMalam, newTimestamp);
    const surplus = dmMesin - (existingLoadReading.avgLoad ?? 0);

    return this.prisma.loadReading.update({
      where: { id },
      data: {
        ...updateData,
        surplus,
        dmMesin,
      },
      include: {
        machine: {
          include: {
            plant: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });
  }

  async deleteLoadReading(id: number) {
    await this.getLoadReadingById(id);
    return this.prisma.loadReading.delete({ where: { id } });
  }

  private getAggregatedDataByLoadReadings(
    loadReadings: (ReturnType<typeof this.getDmMesin> extends never
      ? any
      : {
          timestamp: Date;
          load: number | null;
          dmSiang: number | null;
          dmMalam: number | null;
          machine: { plant: { type: PlantType } };
        })[],
  ) {
    if (loadReadings.length === 0) {
      return {
        plantType: null,
        avgPerPlantType: 0,
        dmMesinSum: 0,
        surplus: 0,
        totalReadings: 0,
        dateRange: {
          from: startOfDay(new Date()).toISOString(),
          to: endOfDay(new Date()).toISOString(),
        },
      };
    }

    const totalLoad = loadReadings.reduce(
      (sum, reading) => sum + (reading.load ?? 0),
      0,
    );
    const avgPerPlantType = totalLoad / loadReadings.length;

    const dmMesinSum = loadReadings.reduce((sum, reading) => {
      const dmMesinForReading = this.getDmMesin(
        reading.dmSiang,
        reading.dmMalam,
        reading.timestamp,
      );
      return sum + dmMesinForReading;
    }, 0);

    return {
      plantType: loadReadings[0].machine.plant.type,
      avgPerPlantType,
      dmMesinSum,
      surplus: dmMesinSum - avgPerPlantType,
      totalReadings: loadReadings.length,
      dateRange: {
        from: startOfDay(new Date()).toISOString(),
        to: endOfDay(new Date()).toISOString(),
      },
    };
  }

  private getDmMesin(
    dmSiang?: number | null,
    dmMalam?: number | null,
    timestamp?: Date,
  ): number {
    const hour = (timestamp ?? new Date()).getUTCHours();
    const isNight = hour >= 18 || hour < 6;
    return isNight ? (dmMalam ?? 0) : (dmSiang ?? 0);
  }

  private getTodayDateRange() {
    const now = new Date();
    return {
      startOfDay: startOfDay(now),
      endOfDay: endOfDay(now),
    };
  }
}
