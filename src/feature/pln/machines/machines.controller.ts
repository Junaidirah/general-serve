import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from '../dto/create-machine.dto';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createMachineDto: CreateMachineDto) {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  findAll(@Query('plantId') plantId?: string) {
    return this.machinesService.findAll(plantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }
}
