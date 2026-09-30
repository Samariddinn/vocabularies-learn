import { Module } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service.js';
import { VocabulariesController } from './vocabularies.controller.js';

@Module({
  controllers: [VocabulariesController],
  providers: [VocabulariesService],
})
export class VocabulariesModule {}
