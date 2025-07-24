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
  ParseIntPipe,
} from '@nestjs/common';
import { LoadReadingsService } from './load-readings.service';
import {
  CreateLoadReadingDto,
  BulkCreateLoadReadingDto,
} from './dto/create-load-reading.dto';

@Controller('load-readings')
export class LoadReadingsController {
  constructor(private readonly loadReadingsService: LoadReadingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createLoadReadingDto: CreateLoadReadingDto) {
    return this.loadReadingsService.create(createLoadReadingDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  bulkCreate(@Body(ValidationPipe) bulkCreateDto: BulkCreateLoadReadingDto) {
    return this.loadReadingsService.bulkCreate(bulkCreateDto);
  }

  @Get('machine/:machineId')
  findByMachine(
    @Param('machineId') machineId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.loadReadingsService.findByMachine(
      machineId,
      startDate,
      endDate,
      limit,
    );
  }

  @Get('machine/:machineId/average')
  getMachineAverage(
    @Param('machineId') machineId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.loadReadingsService.getMachineAverage(
      machineId,
      startDate,
      endDate,
    );
  }
}
