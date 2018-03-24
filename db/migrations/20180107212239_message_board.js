exports.up = function (knex, Promise) {
    return knex.schema.createTable('message_board', (table) => {
        table.increments()
        table.integer('poster_id').notNullable()
        table.string('poster_name').notNullable()
        table.text('content').notNullable()
        table.jsonb('post_time').notNullable()
        table.integer('house_id').references('id').inTable('houses').notNullable().defaultTo(0).onDelete('CASCADE').index()
        table.timestamps(true, true)
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('message_board')
};
