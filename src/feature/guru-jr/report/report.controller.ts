import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// update
import { ReportService } from '../report/report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '../../../middleware/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../utils/multer.config';

@Controller('report')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('media', multerConfig))
  async create(
    @Req() req,
    @Body() dto: CreateReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const mediaUrl = file
      ? await this.reportService.uploadMedia(file)
      : undefined;
    return this.reportService.create(req.user.id, dto, mediaUrl);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.reportService.findAll(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reportService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reportService.delete(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateReportDto>) {
    return this.reportService.update(id, dto);
  }
}
