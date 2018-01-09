exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users_chores').del()
    .then(function() {
      // Inserts seed entries
      // return knex('users_chores').insert([
      //   {}
      // ]);
    }).then(() => {
      return knex.raw(
        "SELECT setval('users_chores_id_seq', (SELECT MAX(id) FROM users_chores));"
      );
    });
};
