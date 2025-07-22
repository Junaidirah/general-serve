import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './feature/guru-jr/user/user.service';
import { UserModule } from './feature/guru-jr/user/user.module';
import { ReportService } from './feature/guru-jr/report/report.service';
import { ReportController } from './feature/guru-jr/report/report.controller';
import { ReportModule } from './feature/guru-jr/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    ReportModule,
  ],
  controllers: [AppController, ReportController],
  providers: [AppService, ReportService],
})
export class AppModule {}
