import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DailySummariesService {
  constructor(private prisma: PrismaService) {}

  async findByMachine(machineId: string, startDate?: string, endDate?: string) {
    const where: any = { machineId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return await this.prisma.dailySummary.findMany({
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
        date: 'desc',
      },
    });
  }

  async findByDate(date: string) {
    return await this.prisma.dailySummary.findMany({
      where: {
        date: new Date(date),
      },
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
        machine: {
          plant: {
            name: 'asc',
          },
        },
      },
    });
  }

  async getTotalLoadByDate(date: string) {
    const summaries = await this.findByDate(date);

    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;

    let totalLoad = 0;
    let totalDemand = 0;
    let machineCount = 0;

    const machineDetails = summaries.map((summary) => {
      const currentDemand = isDaytime ? summary.dmSiang : summary.dmMalam;
      const averageLoad =
        summary.maxLoad && summary.minLoad
          ? (summary.maxLoad + summary.minLoad) / 2
          : 0;

      if (averageLoad > 0) {
        totalLoad += averageLoad;
        machineCount++;
      }

      if (currentDemand) {
        totalDemand += currentDemand;
      }

      return {
        machine: summary.machine,
        maxLoad: summary.maxLoad,
        minLoad: summary.minLoad,
        averageLoad,
        dmSiang: summary.dmSiang,
        dmMalam: summary.dmMalam,
        currentDemand,
      };
    });

    const surplus = totalDemand - totalLoad;

    return {
      date,
      period: isDaytime ? 'SIANG' : 'MALAM',
      summary: {
        totalLoad,
        totalDemand,
        surplus,
        machineCount,
        averageLoadPerMachine: machineCount > 0 ? totalLoad / machineCount : 0,
      },
      machines: machineDetails,
    };
  }

  async getPlantSummary(plantId?: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();

    const where: any = {
      date: targetDate,
    };

    if (plantId) {
      where.machine = {
        plantId,
      };
    }

    const summaries = await this.prisma.dailySummary.findMany({
      where,
      include: {
        machine: {
          include: {
            plant: true,
          },
        },
      },
    });

    // Group by plant
    const plantGroups = summaries.reduce((acc, summary) => {
      const plantId = summary.machine.plant.id;
      if (!acc[plantId]) {
        acc[plantId] = {
          plant: summary.machine.plant,
          machines: [],
          totals: {
            maxLoad: 0,
            minLoad: 0,
            dmSiang: 0,
            dmMalam: 0,
            machineCount: 0,
          },
        };
      }

      acc[plantId].machines.push({
        machine: summary.machine,
        maxLoad: summary.maxLoad,
        minLoad: summary.minLoad,
        dmSiang: summary.dmSiang,
        dmMalam: summary.dmMalam,
      });

      if (summary.maxLoad) acc[plantId].totals.maxLoad += summary.maxLoad;
      if (summary.minLoad) acc[plantId].totals.minLoad += summary.minLoad;
      if (summary.dmSiang) acc[plantId].totals.dmSiang += summary.dmSiang;
      if (summary.dmMalam) acc[plantId].totals.dmMalam += summary.dmMalam;
      acc[plantId].totals.machineCount++;

      return acc;
    }, {});

    return {
      date: targetDate.toISOString().split('T')[0],
      plants: Object.values(plantGroups),
    };
  }
}
