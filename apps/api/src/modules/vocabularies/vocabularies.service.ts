import { Inject, Injectable } from '@nestjs/common';
import { Database } from '../../database/database.js';
import { VocabularyCreateDto } from './dto/vocabularies.dto.js';

@Injectable()
export class VocabulariesService {
    @Inject(Database) private _db: Database;

    async create(userId: string, dto: VocabularyCreateDto) {
        try {
            return this._db.insertInto('vocabularies')
                .values({
                    user_id: userId,
                    word: dto.word.trim(),
                    pronunciation: dto.pronunciation,
                    part_of_speech: dto.part_of_speech,
                    level: dto.level,
                    meaning: dto.meaning,
                    sentences: dto.sentences,
                    collocations: dto.collocations,
                })
                .returningAll()
                .executeTakeFirstOrThrow();
        } catch (error) {
            console.log(error, 'ERROR')
        }
    }

    async list(userId: string) {
        return await this._db.selectFrom('vocabularies as v')
            .where('v.user_id', '=', userId)
            .selectAll('v')
            .orderBy('v.created_at', 'desc')
            .execute()
    }
}
