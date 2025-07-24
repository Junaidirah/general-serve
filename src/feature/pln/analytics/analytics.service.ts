import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlantType, Plant, Machine } from '@prisma/client';

export interface MachineAverageResult {
  machine: {
    id: string;
    identifier: string;
    plant: {
      name: string;
      type: PlantType;
    };
  };
  statistics: {
    averageLoad: number;
    maxLoad: number;
    minLoad: number;
    totalReadings: number;
  };
}
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAllMachinesAverage(startDate?: string, endDate?: string) {
    // PERBAIKAN 1: Ambil semua mesin dan simpan di Map untuk akses cepat.
    const allMachines = await this.prisma.machine.findMany({
      include: {
        plant: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });
    const machineMap = new Map(allMachines.map((m) => [m.id, m]));

    // PERBAIKAN 2: Gunakan satu query 'groupBy' untuk efisiensi maksimal.
    // Ini menggantikan loop yang menyebabkan N+1 query.
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate);
      if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    const statsByMachine = await this.prisma.loadReading.groupBy({
      by: ['machineId'],
      where: whereClause,
      _avg: { load: true },
      _max: { load: true },
      _min: { load: true },
      _count: { load: true },
    });

    // PERBAIKAN 3: Hitung total sistem secara akurat.
    let totalLoadSum = 0;
    let totalReadingsCount = 0;
    let overallMaxLoad = 0;
    const machineResults: MachineAverageResult[] = [];

    for (const stats of statsByMachine) {
      const machine = machineMap.get(stats.machineId);
      if (!machine) continue; // Lewati jika mesin tidak ditemukan

      const averageLoad = stats._avg.load || 0;
      const totalReadings = stats._count.load || 0;
      const maxLoad = stats._max.load || 0;

      // Kumpulkan data untuk ringkasan sistem
      totalLoadSum += averageLoad * totalReadings;
      totalReadingsCount += totalReadings;
      if (maxLoad > overallMaxLoad) {
        overallMaxLoad = maxLoad;
      }

      machineResults.push({
        machine: {
          id: machine.id,
          identifier: machine.identifier,
          plant: machine.plant,
        },
        statistics: {
          averageLoad: averageLoad,
          maxLoad: maxLoad,
          minLoad: stats._min.load || 0,
          totalReadings: totalReadings,
        },
      });
    }

    const activeMachines = machineResults.length;

    return {
      period: { startDate, endDate },
      summary: {
        totalMachines: allMachines.length,
        activeMachines,
        // Ini adalah rata-rata beban sebenarnya dari semua mesin aktif
        systemWideAverageLoad:
          totalReadingsCount > 0 ? totalLoadSum / totalReadingsCount : 0,
        // Ini adalah beban puncak yang tercatat di seluruh sistem
        systemWideMaxLoad: overallMaxLoad,
      },
      machines: machineResults,
    };
  }

  async getCurrentSystemStatus() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentHour = now.getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;

    const summaries = await this.prisma.dailySummary.findMany({
      where: { date: today },
      include: { machine: { include: { plant: true } } },
    });

    let totalCurrentDemand = 0;
    let totalAverageLoad = 0;
    let activeMachines = 0;
    const plantSummary = {};

    for (const summary of summaries) {
      const plantId = summary.machine.plant.id;
      const currentDemand = isDaytime ? summary.dmSiang : summary.dmMalam;

      // CATATAN: Rumus ini menghitung 'nilai tengah' (mid-range), bukan 'rata-rata' (average).
      // Untuk akurasi terbaik, nilai rata-rata sebenarnya harus dihitung dan disimpan di tabel dailySummary.
      const averageLoad =
        summary.maxLoad && summary.minLoad
          ? (summary.maxLoad + summary.minLoad) / 2
          : 0;

      if (!plantSummary[plantId]) {
        plantSummary[plantId] = {
          plant: summary.machine.plant,
          totalDemand: 0,
          totalLoad: 0,
          machineCount: 0,
        };
      }

      if (currentDemand) {
        totalCurrentDemand += currentDemand;
        plantSummary[plantId].totalDemand += currentDemand;
      }

      if (averageLoad > 0) {
        totalAverageLoad += averageLoad;
        plantSummary[plantId].totalLoad += averageLoad;
        activeMachines++;
      }
      plantSummary[plantId].machineCount++;
    }

    const surplus = totalCurrentDemand - totalAverageLoad;
    const utilizationRate =
      totalCurrentDemand > 0
        ? (totalAverageLoad / totalCurrentDemand) * 100
        : 0;

    return {
      timestamp: now,
      period: isDaytime ? 'SIANG' : 'MALAM',
      systemStatus: {
        totalDemand: totalCurrentDemand,
        totalLoad: totalAverageLoad,
        surplus,
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        activeMachines,
        status: surplus > 0 ? 'SURPLUS' : surplus < 0 ? 'DEFICIT' : 'BALANCED',
      },
      plants: Object.values(plantSummary),
    };
  }
}
