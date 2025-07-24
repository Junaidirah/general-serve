import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('machines-average')
  getAllMachinesAverage(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAllMachinesAverage(startDate, endDate);
  }

  @Get('system-status')
  getCurrentSystemStatus() {
    return this.analyticsService.getCurrentSystemStatus();
  }
}
