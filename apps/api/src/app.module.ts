import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './core/auth/auth.module.js';
import { VocabulariesModule } from './modules/vocabularies/vocabularies.module.js';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, VocabulariesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
