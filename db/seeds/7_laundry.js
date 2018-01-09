exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('laundry').del()
        .then(function() {
            // Inserts seed entries
            // return knex('laundry').insert([
            //   {}
            // ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('laundry_id_seq', (SELECT MAX(id) FROM laundry));`
            );
        });
};
