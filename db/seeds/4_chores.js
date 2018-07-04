exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('chores').del()
        .then(function () {
            // Inserts seed entries
            return knex('chores').insert([
                {
                    id: 1,
                    title: 'Clean Kitchen Counters, Sink',
                    daysDue: JSON.stringify([0, 3]),
                    currentDueDay: { daysDueIndex: 1, date: '2018-05-09' },
                    cycle: JSON.stringify([ { index: 0, uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' } ]),
                    currentAssigned: { index: 0, uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' },
                    upcoming: { index: 0, uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' },
                    done: false,
                    house_id: 1
                },
                {
                    id: 2,
                    title: 'Dust and tidy',
                    daysDue: JSON.stringify([2, 6]),
                    currentDueDay: { date: "2018-05-08", daysDueIndex: 0 },
                    cycle: JSON.stringify([ 
                        { index: 0, uid: 'zwZfygLIMugO3xKrhRloTJtHvQm2', name: 'Cassa' },
                        { index: 1, uid: '1FOSEK8IOYZsNDwsVCE6pkyMiPC3', name: 'Lindsey' },
                        { index: 2, uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' } 
                    ]),
                    currentAssigned: { index: 1, uid: '1FOSEK8IOYZsNDwsVCE6pkyMiPC3', name: 'Lindsey' },
                    upcoming: { index: 2, uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' },
                    done: false,
                    house_id: 1
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('chores_id_seq', (SELECT MAX(id) FROM chores));`
            );
        });
};
