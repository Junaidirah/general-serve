import { Controller, Get, Param, Query } from '@nestjs/common';
import { DailySummariesService } from './daily-summaries.service';

@Controller('daily-summaries')
export class DailySummariesController {
  constructor(private readonly dailySummariesService: DailySummariesService) {}

  @Get('machine/:machineId')
  findByMachine(
    @Param('machineId') machineId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailySummariesService.findByMachine(
      machineId,
      startDate,
      endDate,
    );
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.dailySummariesService.findByDate(date);
  }

  @Get('total/:date')
  getTotalLoadByDate(@Param('date') date: string) {
    return this.dailySummariesService.getTotalLoadByDate(date);
  }

  @Get('plant-summary')
  getPlantSummary(
    @Query('plantId') plantId?: string,
    @Query('date') date?: string,
  ) {
    return this.dailySummariesService.getPlantSummary(plantId, date);
  }
}
