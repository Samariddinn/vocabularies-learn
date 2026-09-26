import { PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import pg from 'pg';

process.loadEnvFile(); // read DATABASE_URL from .env

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    }),
    migrations: {
        migrationFolder: 'src/database/migrations',
    },
});