import { Test, TestingModule } from '@nestjs/testing';
import { DriverReimburseController } from './driver_reimburse.controller';

describe('DriverReimburseController', () => {
  let controller: DriverReimburseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverReimburseController],
    }).compile();

    controller = module.get<DriverReimburseController>(DriverReimburseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
