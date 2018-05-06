exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('chores').del()
        .then(function () {
            // Inserts seed entries
            return knex('chores').insert([
                {
                    id: 1,
                    chore: 'Clean Kitchen Counters, Sink',
                    daysDue: JSON.stringify([0, 3]),
                    cycle: { cycleList: [4] },
                    currentDueDay: { currentDueDay: "2017-07-26", currentDueIdx: 1 },
                    currentAssigned: 0,
                    dueToday: true,
                    done: false,
                    late: false,
                    house_id: 1
                },
                {
                    id: 4,
                    title: 'Dust and tidy',
                    daysDue: JSON.stringify([2, 6]),
                    currentDueDay: { date: "2018-05-8", index: 0 },
                    cycle: JSON.stringify(['zwZfygLIMugO3xKrhRloTJtHvQm2', 'UTxHlglXk1VknBg7oTOE6leusU12', '1FOSEK8IOYZsNDwsVCE6pkyMiPC3']),
                    currentAssigned: 'UTxHlglXk1VknBg7oTOE6leusU12',
                    upcoming: JSON.stringify(['1FOSEK8IOYZsNDwsVCE6pkyMiPC3', 'zwZfygLIMugO3xKrhRloTJtHvQm2']),
                    done: false,
                    late: false,
                    house_id: 1

                },
                {
                    id: 2,
                    chore: 'Trash to curb',
                    daysDue: { daysDue: [5] },
                    cycle: { cycleList: [3, 4] },
                    currentDueDay: { currentDueDay: "2017-07-28", currentDueIdx: 0 },
                    currentAssigned: 0,
                    dueToday: false,
                    done: true,
                    late: false,
                    house_id: 1
                },
                {
                    id: 3,
                    chore: 'Clean bathroom',
                    daysDue: { daysDue: [0, 4] },
                    cycle: { cycleList: [2, 4] },
                    currentDueDay: { currentDueDay: "2017-07-30", currentDueIdx: 0 },
                    currentAssigned: 0,
                    dueToday: true,
                    done: false,
                    late: true,
                    house_id: 1
                }
            ]);
        }).then(() => {
            return knex.raw(
                `SELECT setval('chores_id_seq', (SELECT MAX(id) FROM chores));`
            );
        });
};
