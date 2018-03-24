exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('message_board').del()
        .then(function () {
            // Inserts seed entries
            return knex('message_board').insert([
                {
                    id: 1,
                    poster_id: 2,
                    poster_name: 'Ryan',
                    content: 'Rent + utilities this month is $607.82.',
                    post_time: { post_time: '2017-07-23T10:13:53.260Z' },
                    house_id: 1
                },
                {
                    id: 2,
                    poster_id: 0,
                    poster_name: 'App Notification',
                    content: `Lindsey added 'Coffee Filters' to the communal shopping list.`,
                    post_time: { postTime: '2017-07-24T17:47:53.260Z' },
                    house_id: 1
                },
                {
                    id: 3,
                    poster_id: 3,
                    poster_name: 'Cassa',
                    content: 'Hey guys! I have an avocado I won\'t have time to eat before I leave for the weekend. It\'s up for grabs on the kitchen counter!',
                    post_time: { postTime: '2017-07-25T14:35:53.260Z' },
                    house_id: 1
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('message_board_id_seq', (SELECT MAX(id) FROM message_board));`
            );
        });
};
