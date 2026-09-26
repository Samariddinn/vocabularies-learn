import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Test endpoint: lets the frontend check that the API is reachable.
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    console.log('Endpoint works')
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
