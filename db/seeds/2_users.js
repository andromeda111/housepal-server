exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function() {
            // Inserts seed entries
            return knex('users').insert([
                {
                    id: 1,
                    uid: 'Ekj3cd0yM6TQcXfGekUbt5wjsWw2',
                    name: 'John',
                    email: 'john@housepal.com',
                    h_pw: 'asdfasdf',
                    deviceId: 'blank1',
                    house_id: 1
                },
                {
                    id: 2,
                    uid: 'nZvPKdxv7DfU294eRRH7g2OwLUB3',
                    name: 'Ryan',
                    email: 'ryan@housepal.com',
                    h_pw: 'asdfasdf',
                    deviceId: 'blank2',
                    house_id: 2
                },
                {
                    id: 3,
                    uid: 'ybPBlcFSngSAXO4DyOV7RMCAFwA2',
                    name: 'Cassa',
                    email: 'cassa@housepal.com',
                    h_pw: 'asdfasdf',
                    deviceId: 'blank3',
                    house_id: 1
                },
                {
                    id: 4,
                    uid: 'FmByfURR7oeX7jtafMtGOriCw3A2',
                    name: 'Lindsey',
                    email: 'lindsey@housepal.com',
                    h_pw: 'asdfasdf',
                    deviceId: 'blank4',
                    house_id: 1
                },
                {
                    id: 5,
                    uid: 'SZXZ7vzglFhBFtiS27MmlLXtmZl1',
                    name: 'David',
                    email: 'david@housepal.com',
                    h_pw: 'asdfasdf',
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
