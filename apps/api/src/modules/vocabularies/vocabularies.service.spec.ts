import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesService } from './vocabularies.service.js';

describe('VocabulariesService', () => {
  let service: VocabulariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VocabulariesService],
    }).compile();

    service = module.get<VocabulariesService>(VocabulariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
