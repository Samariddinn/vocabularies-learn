import { Injectable } from '@nestjs/common';
import { Database } from '../../database/database.js';

@Injectable()
export class UsersService {
    constructor(private readonly _db: Database) { }

    findByLogin(login: string) {
        return this._db
            .selectFrom('users')
            .selectAll()
            .where('login', '=', login)
            .executeTakeFirst();
    }

    findById(id: string) {
        return this._db.selectFrom('users')
            .select(['id', 'login', 'role', 'created_at', 'updated_at'])
            .where('users.id', '=', id).executeTakeFirst();
    }

    create(login: string, passwordHash: string) {
        return this._db
            .insertInto('users')
            .values({ login, password_hash: passwordHash })
            .returning(['id', 'login', 'role', 'created_at'])
            .executeTakeFirstOrThrow();
    }
}
