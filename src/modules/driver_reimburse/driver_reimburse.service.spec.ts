import { Test, TestingModule } from '@nestjs/testing';
import { DriverReimburseService } from './driver_reimburse.service';

describe('DriverReimburseService', () => {
  let service: DriverReimburseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverReimburseService],
    }).compile();

    service = module.get<DriverReimburseService>(DriverReimburseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
