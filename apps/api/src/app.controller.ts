import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Database } from './database/database.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly db: Database) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
