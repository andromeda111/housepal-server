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
                    currentDueDay: { date: '2018-05-09', index: 1 },
                    cycle: JSON.stringify(['UTxHlglXk1VknBg7oTOE6leusU12']),
                    currentAssigned: { uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John', index: 0 },
                    upcoming: JSON.stringify([]),
                    dueToday: false,
                    done: false,
                    late: false,
                    house_id: 1
                },
                {
                    id: 2,
                    title: 'Dust and tidy',
                    daysDue: JSON.stringify([2, 6]),
                    currentDueDay: { date: "2018-05-08", index: 0 },
                    cycle: JSON.stringify(['zwZfygLIMugO3xKrhRloTJtHvQm2', '1FOSEK8IOYZsNDwsVCE6pkyMiPC3', 'UTxHlglXk1VknBg7oTOE6leusU12']),
                    currentAssigned: { uid: '1FOSEK8IOYZsNDwsVCE6pkyMiPC3', name: 'Lindsey', index: 1 },
                    upcoming: JSON.stringify([{ uid: 'UTxHlglXk1VknBg7oTOE6leusU12', name: 'John' }, { uid: 'zwZfygLIMugO3xKrhRloTJtHvQm2', name: 'Cassa' }]),
                    done: false,
                    late: false,
                    house_id: 1
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('chores_id_seq', (SELECT MAX(id) FROM chores));`
            );
        });
};
