import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import pg from 'pg';
import { Database } from './database.js';

@Global()
@Module({
    providers: [
        {
            provide: Database,
            useFactory: () =>
                new Database({
                    dialect: new PostgresDialect({
                        pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
                    }),
                }),
        },
    ],
    exports: [Database],
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(private readonly db: Database) { }

    async onApplicationShutdown() {
        await this.db.destroy();
    }
}