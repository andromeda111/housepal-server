exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function () {
            // Inserts seed entries
            return knex('users').insert([
                {
                    id: 1,
                    uid: 'UTxHlglXk1VknBg7oTOE6leusU12',
                    name: 'John',
                    email: 'john@housepal.com',
                    password: 'asdfasdf',
                    device_id: 'blank1',
                    house_id: 1
                },
                {
                    id: 2,
                    name: 'Ryan',
                    uid: '7POBhbqAfbeL71Twe3PH9OeiZzd2',
                    email: 'ryan@housepal.com',
                    password: 'asdfasdf',
                    device_id: 'blank2',
                    house_id: 1
                },
                {
                    id: 3,
                    name: 'Cassa',
                    uid: 'zwZfygLIMugO3xKrhRloTJtHvQm2',
                    email: 'cassa@housepal.com',
                    password: 'asdfasdf',
                    device_id: 'blank3',
                    house_id: 1
                },
                {
                    id: 4,
                    uid: '1FOSEK8IOYZsNDwsVCE6pkyMiPC3',
                    name: 'Lindsey',
                    email: 'lindsey@housepal.com',
                    password: 'asdfasdf',
                    device_id: 'blank4',
                    house_id: 1
                },
                {
                    id: 5,
                    uid: 'SeCcCLYc8UW5FBTIcfEl1rLNUdk1',
                    name: 'David',
                    email: 'david@housepal.com',
                    password: 'asdfasdf',
                    device_id: 'blank5',
                    house_id: 2
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`
            );
        });
};
