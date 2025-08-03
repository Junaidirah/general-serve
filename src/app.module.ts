import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './feature/guru-jr/user/user.service';
import { UserModule } from './feature/guru-jr/user/user.module';
import { ReportService } from './feature/guru-jr/report/report.service';
import { ReportController } from './feature/guru-jr/report/report.controller';
import { ReportModule } from './feature/guru-jr/report/report.module';
import { PlantsService } from './feature/pln/plant/plant.service';
import { PlantsController } from './feature/pln/plant/plant.controller';
import { PlantsModule } from './feature/pln/plant/plant.module';
import { MachinesService } from './feature/pln/machines/machines.service';
import { MachinesController } from './feature/pln/machines/machines.controller';
import { MachinesModule } from './feature/pln/machines/machines.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { LoadReadingsModule } from './feature/pln/load-readings/load-readings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    ReportModule,
    PlantsModule,
    MachinesModule,
    PrismaModule,
    LoadReadingsModule,
  ],
  controllers: [
    AppController,
    ReportController,
    PlantsController,
    MachinesController,
  ],
  providers: [AppService, ReportService, PlantsService, MachinesService],
})
export class AppModule {}
