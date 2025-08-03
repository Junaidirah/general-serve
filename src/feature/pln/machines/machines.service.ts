import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMachineDto } from '../dto/create-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async create(createMachineDto: CreateMachineDto) {
    try {
      // Verify plant exists
      const plant = await this.prisma.plant.findUnique({
        where: { id: createMachineDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException(
          `Plant with ID ${createMachineDto.plantId} not found`,
        );
      }

      return await this.prisma.machine.create({
        data: createMachineDto,
        include: {
          plant: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(plantId?: string) {
    const where = plantId ? { plantId } : {};

    return await this.prisma.machine.findMany({
      where,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            readings: true,
          },
        },
      },
      orderBy: [{ plant: { name: 'asc' } }, { identifier: 'asc' }],
    });
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        readings: {
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
          select: {
            id: true,
            timestamp: true,
            load: true,
            avgLoad: true,
            maxLoad: true,
            minLoad: true,
            dmSiang: true,
            dmMalam: true,
            dmMesin: true,
            surplus: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            readings: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async update(id: string, updateMachineDto: Partial<CreateMachineDto>) {
    // Check if machine exists
    const existingMachine = await this.findOne(id);

    // If updating plantId, verify new plant exists
    if (
      updateMachineDto.plantId &&
      updateMachineDto.plantId !== existingMachine.plantId
    ) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: updateMachineDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException(
          `Plant with ID ${updateMachineDto.plantId} not found`,
        );
      }
    }

    return await this.prisma.machine.update({
      where: { id },
      data: updateMachineDto,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            readings: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if machine exists
    await this.findOne(id);

    // Check if machine has readings
    const readingsCount = await this.prisma.loadReading.count({
      where: { machineId: id },
    });

    if (readingsCount > 0) {
      throw new ConflictException(
        `Cannot delete machine. It has ${readingsCount} load readings associated with it.`,
      );
    }

    return await this.prisma.machine.delete({
      where: { id },
    });
  }

  async getMachinesByPlantType(plantType: string) {
    return await this.prisma.machine.findMany({
      where: {
        plant: {
          type: plantType as any, // Cast to match your PlantType enum
        },
      },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            readings: true,
          },
        },
      },
      orderBy: [{ plant: { name: 'asc' } }, { identifier: 'asc' }],
    });
  }

  async getMachineStats(id: string) {
    const machine = await this.findOne(id);

    // Get latest readings statistics
    const stats = await this.prisma.loadReading.aggregate({
      where: { machineId: id },
      _avg: {
        load: true,
        avgLoad: true,
      },
      _max: {
        load: true,
        maxLoad: true,
      },
      _min: {
        load: true,
        minLoad: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent readings count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentReadingsCount = await this.prisma.loadReading.count({
      where: {
        machineId: id,
        timestamp: {
          gte: yesterday,
        },
      },
    });

    return {
      machine: {
        id: machine.id,
        identifier: machine.identifier,
        plant: machine.plant,
      },
      statistics: {
        totalReadings: stats._count.id,
        recentReadings: recentReadingsCount,
        avgLoad: stats._avg.load,
        avgOfAvgLoad: stats._avg.avgLoad,
        maxLoad: stats._max.load,
        maxOfMaxLoad: stats._max.maxLoad,
        minLoad: stats._min.load,
        minOfMinLoad: stats._min.minLoad,
      },
    };
  }
}
