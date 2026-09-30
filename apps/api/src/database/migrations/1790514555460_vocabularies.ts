import { sql, type Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('vocabularies')
		.addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
		.addColumn('word', 'varchar(60)', (col) => col.notNull())
		.addColumn('pronunciation', 'varchar(60)')
		.addColumn('part_of_speech', 'varchar(20)')
		.addColumn('level', 'varchar(10)')
		.addColumn('meaning', 'varchar(100)')
		.addColumn('sentences', 'text')
		.addColumn('collocations', 'text')
		.execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('vocabularies').execute();
}
