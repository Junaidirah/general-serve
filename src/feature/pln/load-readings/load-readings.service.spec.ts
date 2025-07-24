import { Test, TestingModule } from '@nestjs/testing';
import { LoadReadingsService } from './load-readings.service';

describe('LoadReadingsService', () => {
  let service: LoadReadingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadReadingsService],
    }).compile();

    service = module.get<LoadReadingsService>(LoadReadingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
