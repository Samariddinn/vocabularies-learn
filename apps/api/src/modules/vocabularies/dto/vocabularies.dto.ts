import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Same list as PARTS_OF_SPEECH in the frontend (core/services/dictionary.ts). */
export const PARTS_OF_SPEECH = [
    'noun',
    'verb',
    'adjective',
    'adverb',
    'pronoun',
    'preposition',
    'conjunction',
    'interjection',
    'phrase',
] as const;

/**
 * Body of POST /vocabularies.
 * Max lengths match the column sizes in the vocabularies migration.
 * No `user_id` here — it comes from the logged-in user's token, never from the client.
 */
export class VocabularyCreateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    word: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    pronunciation?: string;

    @IsOptional()
    @IsIn(PARTS_OF_SPEECH)
    part_of_speech?: (typeof PARTS_OF_SPEECH)[number];

    @IsOptional()
    @IsString()
    @MaxLength(10)
    level?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    meaning: string;

    @IsOptional()
    @IsString()
    sentences?: string;

    @IsOptional()
    @IsString()
    collocations?: string;
}
