exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('chores').del()
        .then(function() {
            // Inserts seed entries
            // NOTE: Need to update daysDue
            // return knex('chores').insert([
            //     {}
            // ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('chores_id_seq', (SELECT MAX(id) FROM chores));`
            );
        });
};
