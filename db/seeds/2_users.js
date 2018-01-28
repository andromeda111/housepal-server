exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function() {
            // Inserts seed entries
            return knex('users').insert([
                {
                    id: 1,
                    name: 'John',
                    email: 'john@housepal.com',
                    password: 'asdfasdf',
                    deviceId: 'blank1',
                    house_id: 1
                },
                {
                    id: 2,
                    name: 'Ryan',
                    email: 'ryan@housepal.com',
                    password: 'asdfasdf',
                    deviceId: 'blank2',
                    house_id: 2
                },
                {
                    id: 3,
                    name: 'Cassa',
                    email: 'cassa@housepal.com',
                    password: 'asdfasdf',
                    deviceId: 'blank3',
                    house_id: 1
                },
                {
                    id: 4,
                    name: 'Lindsey',
                    email: 'lindsey@housepal.com',
                    password: 'asdfasdf',
                    deviceId: 'blank4',
                    house_id: 1
                },
                {
                    id: 5,
                    name: 'David',
                    email: 'david@housepal.com',
                    password: 'asdfasdf',
                    deviceId: 'blank5',
                    house_id: 2
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`
            );
        });
};
