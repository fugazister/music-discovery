import { Test, TestingModule } from '@nestjs/testing';
import { BandcampController } from './bandcamp.controller';

describe('BandcampController', () => {
  let controller: BandcampController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BandcampController],
    }).compile();

    controller = module.get<BandcampController>(BandcampController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
