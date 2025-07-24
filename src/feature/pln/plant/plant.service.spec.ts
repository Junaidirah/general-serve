import { Test, TestingModule } from '@nestjs/testing';
import { PlantsService } from '../plant/plant.service';

describe('PlantService', () => {
  let service: PlantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantsService],
    }).compile();

    service = module.get<PlantsService>(PlantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
