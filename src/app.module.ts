import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlnModule } from './feature/pln/pln.module';
import { GuruJrModule } from './feature/guru-jr/guru-jr.module';

@Module({
  imports: [PlnModule, GuruJrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
