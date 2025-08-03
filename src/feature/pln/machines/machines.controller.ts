import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from '../dto/create-machine.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('machines')
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new machine' })
  @ApiResponse({ status: 201, description: 'Machine created successfully' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all machines' })
  @ApiQuery({
    name: 'plantId',
    required: false,
    description: 'Filter by plant ID',
  })
  @ApiResponse({ status: 200, description: 'Machines retrieved successfully' })
  async findAll(@Query('plantId') plantId?: string) {
    return this.machinesService.findAll(plantId);
  }

  @Get('plant-type/:plantType')
  @ApiOperation({ summary: 'Get machines by plant type' })
  @ApiParam({
    name: 'plantType',
    description: 'Plant type to filter machines',
  })
  @ApiResponse({ status: 200, description: 'Machines retrieved successfully' })
  async getMachinesByPlantType(@Param('plantType') plantType: string) {
    return this.machinesService.getMachinesByPlantType(plantType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine by ID' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  async findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get machine statistics' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({
    status: 200,
    description: 'Machine statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  async getMachineStats(@Param('id') id: string) {
    return this.machinesService.getMachineStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update machine by ID' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine updated successfully' })
  @ApiResponse({ status: 404, description: 'Machine or Plant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMachineDto: Partial<CreateMachineDto>,
  ) {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete machine by ID' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 204, description: 'Machine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete machine with existing readings',
  })
  async remove(@Param('id') id: string) {
    await this.machinesService.remove(id);
  }
}
