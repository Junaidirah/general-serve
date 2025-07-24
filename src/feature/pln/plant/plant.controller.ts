import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlantsService } from '../plant/plant.service';
import { CreatePlantDto } from '../dto/create-plant.dto';
import { UpdatePlantDto } from '../dto/update-plant.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createPlantDto: CreatePlantDto) {
    return this.plantsService.create(createPlantDto);
  }

  @Get()
  findAll() {
    return this.plantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantsService.update(id, updatePlantDto);
  }
}
