exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users_chores').del()
    .then(function() {
      // Inserts seed entries
      return knex('users_chores').insert([
        {
          id: 1,
          user_uid: '2UTxHlglXk1VknBg7oTOE6leusU12',
          chore_id: 1
        },
        {
          id: 2,
          user_uid: 'zwZfygLIMugO3xKrhRloTJtHvQm2',
          chore_id: 2
        },
        {
          id: 3,
          user_uid: '1FOSEK8IOYZsNDwsVCE6pkyMiPC3',
          chore_id: 2
        },
        {
          id: 4,
          user_uid: 'UTxHlglXk1VknBg7oTOE6leusU12',
          chore_id: 2
        },
      ]);
    }).then(() => {
      return knex.raw(
        "SELECT setval('users_chores_id_seq', (SELECT MAX(id) FROM users_chores));"
      );
    });
};
