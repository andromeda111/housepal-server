exports.up = function (knex, Promise) {
	return knex.schema.createTable('houses', table => {
		table.increments();
		table.string('houseName').notNullable().unique();
		table.string('houseCode').notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('houses');
};
