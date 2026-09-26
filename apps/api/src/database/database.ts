import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import type { DB } from './types.js';

@Injectable()
export class Database extends Kysely<DB> { }