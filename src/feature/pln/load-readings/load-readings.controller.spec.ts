import { Test, TestingModule } from '@nestjs/testing';
import { LoadReadingsController } from './load-readings.controller';

describe('LoadReadingsController', () => {
  let controller: LoadReadingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadReadingsController],
    }).compile();

    controller = module.get<LoadReadingsController>(LoadReadingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
