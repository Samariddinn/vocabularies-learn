import { sql, type Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('vocabularies')
		.addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
		.addColumn('word', 'varchar(100)', (col) => col.notNull())
		.addColumn('pronunciation', 'varchar(60)')
		.addColumn('part_of_speech', 'varchar(20)')
		.addColumn('level', 'varchar(2)')
		.addColumn('meaning', 'text', (col) => col.notNull())
		.addColumn('sentences', 'text')
		.addColumn('collocations', 'text')

		// Learning progress 
		.addColumn('status', 'smallint', (col) => col.notNull().defaultTo(0))
		.addColumn('attempts', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('correct', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('streak', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('reviewed_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

		// Constraints
		.addCheckConstraint('vocabularies_status_valid', sql`status IN (0, 1, 2)`)
		.execute()

	await db.schema
		.createIndex('vocabularies_user_word_unique')
		.on('vocabularies')
		.unique()
		.expression(sql`user_id, lower(word)`)
		.execute();

	await db.schema
		.createIndex('vocabularies_user_status_idx')
		.on('vocabularies')
		.columns(['user_id', 'status'])
		.execute();

	await sql`COMMENT ON COLUMN vocabularies.status IS '0 = new (never drilled), 1 = learning, 2 = known (memorized)'`.execute(db);
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('vocabularies').execute();
}
