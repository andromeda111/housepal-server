exports.seed = function(knex, Promise) {
	// Deletes ALL existing entries
	return knex('houses')
		.del()
		.then(function() {
			// Inserts seed entries
			return knex('houses').insert([
				{
					id: 1,
					houseName: 'Tanglemansion',
					houseCode: 'icecream'
				},
				{
					id: 2,
					houseName: 'Home 2',
					houseCode: 'h2code'
				}
			]);
		})
		.then(() => {
			return knex.raw(`SELECT setval('houses_id_seq', (SELECT MAX(id) FROM houses));`);
		});
};
