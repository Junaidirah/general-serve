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
            summaries: true,
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
        plant: true,
        readings: {
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
          select: {
            id: true,
            timestamp: true,
            load: true,
            status: true,
          },
        },
        summaries: {
          take: 7,
          orderBy: {
            date: 'desc',
          },
          select: {
            id: true,
            date: true,
            maxLoad: true,
            minLoad: true,
            dmSiang: true,
            dmMalam: true,
          },
        },
        _count: {
          select: {
            readings: true,
            summaries: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }
}
