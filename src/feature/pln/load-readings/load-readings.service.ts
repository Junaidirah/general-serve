import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateLoadReadingDto,
  BulkCreateLoadReadingDto,
} from './dto/create-load-reading.dto';
import { LoadReading } from '@prisma/client';

@Injectable()
export class LoadReadingsService {
  constructor(private prisma: PrismaService) {}

  async create(createLoadReadingDto: CreateLoadReadingDto) {
    try {
      // Verify machine exists
      const machine = await this.prisma.machine.findUnique({
        where: { id: createLoadReadingDto.machineId },
      });

      if (!machine) {
        throw new NotFoundException(
          `Machine with ID ${createLoadReadingDto.machineId} not found`,
        );
      }

      const reading = await this.prisma.loadReading.create({
        data: {
          machineId: createLoadReadingDto.machineId,
          timestamp: new Date(createLoadReadingDto.timestamp),
          load: createLoadReadingDto.load,
          status: createLoadReadingDto.status,
        },
        include: {
          machine: {
            select: {
              id: true,
              identifier: true,
              plant: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      // Auto-update daily summary after creating reading
      await this.updateDailySummary(
        createLoadReadingDto.machineId,
        new Date(createLoadReadingDto.timestamp),
      );

      return reading;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Reading for this machine and timestamp already exists',
        );
      }
      throw error;
    }
  }

  async bulkCreate(bulkCreateDto: BulkCreateLoadReadingDto) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: bulkCreateDto.machineId },
    });

    if (!machine) {
      throw new NotFoundException(
        `Machine with ID ${bulkCreateDto.machineId} not found`,
      );
    }

    const createdReadings: LoadReading[] = [];
    const datesForSummary = new Set<string>();

    for (const reading of bulkCreateDto.readings) {
      try {
        const created = await this.prisma.loadReading.create({
          data: {
            machineId: bulkCreateDto.machineId,
            timestamp: new Date(reading.timestamp),
            load: reading.load,
            status: reading.status,
          },
        });
        createdReadings.push(created);
        datesForSummary.add(created.timestamp.toISOString().split('T')[0]);
      } catch (error) {
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }

    for (const dateStr of datesForSummary) {
      await this.updateDailySummary(bulkCreateDto.machineId, new Date(dateStr));
    }

    return {
      created: createdReadings.length,
      total: bulkCreateDto.readings.length,
      readings: createdReadings,
    };
  }

  async findByMachine(
    machineId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100,
  ) {
    const where: any = { machineId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    return await this.prisma.loadReading.findMany({
      where,
      include: {
        machine: {
          select: {
            identifier: true,
            plant: {
              select: {
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
      take: limit,
    });
  }

  async getMachineAverage(
    machineId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { machineId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const result = await this.prisma.loadReading.aggregate({
      where,
      _avg: {
        load: true,
      },
      _max: {
        load: true,
      },
      _min: {
        load: true,
      },
      _count: {
        load: true,
      },
    });

    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: {
        identifier: true,
        plant: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      machine,
      statistics: {
        averageLoad: result._avg.load,
        maxLoad: result._max.load,
        minLoad: result._min.load,
        totalReadings: result._count.load,
      },
      period: {
        startDate,
        endDate,
      },
    };
  }

  private async updateDailySummary(machineId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all readings for the day
    const readings = await this.prisma.loadReading.findMany({
      where: {
        machineId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    if (readings.length === 0) return;

    // Calculate daily statistics
    const loads = readings.map((r) => r.load);
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);

    // Calculate DM Siang (06:00 - 18:00) and DM Malam (18:00 - 06:00)
    const siangReadings = readings.filter((r) => {
      const hour = r.timestamp.getHours();
      return hour >= 6 && hour < 18;
    });

    const malamReadings = readings.filter((r) => {
      const hour = r.timestamp.getHours();
      return hour >= 18 || hour < 6;
    });

    const dmSiang =
      siangReadings.length > 0
        ? siangReadings.reduce((sum, r) => sum + r.load, 0) /
          siangReadings.length
        : null;

    const dmMalam =
      malamReadings.length > 0
        ? malamReadings.reduce((sum, r) => sum + r.load, 0) /
          malamReadings.length
        : null;

    // Upsert daily summary
    await this.prisma.dailySummary.upsert({
      where: {
        machineId_date: {
          machineId,
          date: startOfDay,
        },
      },
      update: {
        maxLoad,
        minLoad,
        dmSiang,
        dmMalam,
        updatedAt: new Date(),
      },
      create: {
        machineId,
        date: startOfDay,
        maxLoad,
        minLoad,
        dmSiang,
        dmMalam,
        createdAt: new Date(),
      },
    });
  }
}
