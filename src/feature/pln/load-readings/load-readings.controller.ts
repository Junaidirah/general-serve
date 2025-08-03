import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoadReadingService } from '../load-readings/load-readings.service';
import { CreateLoadReadingDto } from './dto/create-load-reading.dto';
import { PlantType } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('load-readings')
@Controller('load-readings')
export class LoadReadingController {
  constructor(private readonly loadReadingService: LoadReadingService) {}

  @Post('machine/:machineId')
  @ApiOperation({ summary: 'Create load reading by machine ID' })
  @ApiParam({ name: 'machineId', description: 'Machine ID' })
  @ApiResponse({
    status: 201,
    description: 'Load reading created successfully',
  })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  async createLoadReadingByMachineId(
    @Param('machineId') machineId: string,
    @Body() createLoadReadingDto: CreateLoadReadingDto,
  ) {
    return this.loadReadingService.createLoadReadingByMachineId(
      machineId,
      createLoadReadingDto,
    );
  }

  @Get('plant-type/:plantType')
  @ApiOperation({ summary: 'Get load readings by plant type' })
  @ApiParam({
    name: 'plantType',
    description: 'Plant type',
    enum: PlantType,
  })
  @ApiResponse({
    status: 200,
    description: 'Load readings retrieved successfully',
  })
  async getLoadReadingByPlantType(@Param('plantType') plantType: PlantType) {
    return this.loadReadingService.getLoadReadingByPlantType(plantType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all load readings' })
  @ApiResponse({
    status: 200,
    description: 'All load readings retrieved successfully',
  })
  async getAllLoadReadings() {
    return this.loadReadingService.getAllLoadReadings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load reading by ID' })
  @ApiParam({ name: 'id', description: 'Load reading ID' })
  @ApiResponse({
    status: 200,
    description: 'Load reading retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Load reading not found' })
  async getLoadReadingById(@Param('id', ParseIntPipe) id: number) {
    return this.loadReadingService.getLoadReadingById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update load reading by ID' })
  @ApiParam({ name: 'id', description: 'Load reading ID' })
  @ApiResponse({
    status: 200,
    description: 'Load reading updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Load reading not found' })
  async updateLoadReading(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateLoadReadingDto>,
  ) {
    return this.loadReadingService.updateLoadReading(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete load reading by ID' })
  @ApiParam({ name: 'id', description: 'Load reading ID' })
  @ApiResponse({
    status: 204,
    description: 'Load reading deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Load reading not found' })
  async deleteLoadReading(@Param('id', ParseIntPipe) id: number) {
    await this.loadReadingService.deleteLoadReading(id);
  }
}
