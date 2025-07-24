import { Test, TestingModule } from '@nestjs/testing';
import { DailySummariesService } from './daily-summaries.service';

describe('DailySummariesService', () => {
  let service: DailySummariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailySummariesService],
    }).compile();

    service = module.get<DailySummariesService>(DailySummariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
