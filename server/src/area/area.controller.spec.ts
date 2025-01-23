import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from '../service/service.service';
import { PrismaService } from '../prisma/prisma.service';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

describe('AreaController', () => {
  let controller: AreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AreaController],
      providers: [ServiceService, AreaService, PrismaService],
    }).compile();

    controller = module.get<AreaController>(AreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
