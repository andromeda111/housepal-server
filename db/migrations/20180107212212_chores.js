exports.up = function(knex, Promise) {
    return knex.schema.createTable('chores', (table) => {
        table.increments()
        table.string('title').notNullable().defaultTo('')
        table.jsonb('daysDue').notNullable()
        table.jsonb('currentDueDay').notNullable()
        table.jsonb('cycle').notNullable()
        table.jsonb('currentAssigned').notNullable()
        table.jsonb('upcoming').notNullable()
        table.boolean('dueToday').notNullable().defaultTo(false)
        table.boolean('done').notNullable().defaultTo(false)
        table.boolean('late').notNullable().defaultTo(false)
        table.integer('house_id').references('id').inTable('houses').notNullable().defaultTo(0).onDelete('CASCADE').index()
        table.timestamps(true, true)
    })
};
  
exports.down = function(knex, Promise) {
    return knex.schema.dropTable('chores')
};
