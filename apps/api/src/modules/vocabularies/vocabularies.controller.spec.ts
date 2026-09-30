import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesController } from './vocabularies.controller.js';
import { VocabulariesService } from './vocabularies.service.js';

describe('VocabulariesController', () => {
  let controller: VocabulariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabulariesController],
      providers: [VocabulariesService],
    }).compile();

    controller = module.get<VocabulariesController>(VocabulariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
