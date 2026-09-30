import { Controller } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service.js';

@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}
}
