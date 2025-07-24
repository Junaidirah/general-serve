import { Test, TestingModule } from '@nestjs/testing';
import { DailySummariesController } from './daily-summaries.controller';

describe('DailySummariesController', () => {
  let controller: DailySummariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailySummariesController],
    }).compile();

    controller = module.get<DailySummariesController>(DailySummariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
