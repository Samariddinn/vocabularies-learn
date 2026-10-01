import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service.js';
import { AuthGuard } from '../../core/auth/auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { VocabularyCreateDto } from './dto/vocabularies.dto.js';
import type { JwtPayload } from '../../core/auth/auth.guard.js';

@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) { }

  @Post('create')
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: VocabularyCreateDto) {
    return this.vocabulariesService.create(user.sub, dto)
  }

  @Get()
  @UseGuards(AuthGuard)
  list(@CurrentUser() user: JwtPayload) {
    return this.vocabulariesService.list(user.sub);
  }
}
