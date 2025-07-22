import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import prisma from '../../../config/db';
import { CreateReportDto } from './dto/create-report.dto';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

@Injectable()
export class ReportService {
  async uploadMedia(file: Express.Multer.File): Promise<string> {
    const fileName = `reports/${uuidv4()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException({
        message: 'Gagal upload file ke Supabase',
        detail: error.message,
      });
    }

    const { data: publicUrl } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    if (!publicUrl || !publicUrl.publicUrl) {
      throw new BadRequestException(
        'Gagal mendapatkan public URL dari Supabase',
      );
    }

    return publicUrl.publicUrl;
  }

  async create(userId: string, dto: CreateReportDto, mediaUrl?: string) {
    const report = await prisma.report.create({
      data: {
        userId,
        ...dto,
        media: mediaUrl,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: 50,
        },
      },
    });

    return report;
  }

  async findAll(userId?: string) {
    return prisma.report.findMany({
      where: userId ? { userId } : {},
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.report.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<CreateReportDto>) {
    await this.findById(id);
    return prisma.report.update({
      where: { id },
      data,
    });
  }
}
