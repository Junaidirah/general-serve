import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePlantDto } from '../dto/create-plant.dto';
import { UpdatePlantDto } from '../dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlantDto: CreatePlantDto) {
    try {
      return await this.prisma.plant.create({
        data: createPlantDto,
        include: {
          machines: {
            select: {
              id: true,
              identifier: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              machines: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Plant name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.plant.findMany({
      include: {
        machines: {
          select: {
            id: true,
            identifier: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            machines: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        machines: {
          include: {
            _count: {
              select: {
                readings: true,
              },
            },
          },
          orderBy: {
            identifier: 'asc',
          },
        },
      },
    });

    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    return plant;
  }

  async update(id: string, updatePlantDto: UpdatePlantDto) {
    try {
      const plant = await this.prisma.plant.update({
        where: { id },
        data: updatePlantDto,
        include: {
          machines: {
            select: {
              id: true,
              identifier: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              machines: true,
            },
          },
        },
      });
      return plant;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Plant with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Plant name already exists');
      }
      throw error;
    }
  }
}
