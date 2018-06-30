const express = require('express');
const router = express.Router();
const db = require('../db')
const checkAuthorization = require('../services/check-auth.middleware')
const moment = require('moment');

router.get('/chores', checkAuthorization, function (req, res, next) {
    const decodedToken = req.locals.decodedToken;
    const uid = decodedToken.uid;

    let allChores = []
    db('users').where({ house_id: 1 }).then(users => {
        db('chores').where({ house_id: 1 }).then(result => {

            allChores = result
            const today = moment().utc();
            // PROBLEM: Chore does not remain "Done" until orignal duedate has passed.
            // Check if Chore is Done, and update/cycle
            // TODO: Chore is "Done" if completed more than 24 hours before the UTC 0000 due date. Otherwise, jump to next due date.
            allChores.forEach(obj => {

                // If a chore is marked as Done.
                if (obj.done) {
                    // If we're at the end of the array, jump back to the zero index. Otherwise, increase by one.
                    let nextDaysDueIndex = 0

                    if (obj.daysDue.length > 1 && obj.daysDue[obj.currentDueDay.index + 1]) {
                        nextDaysDueIndex = obj.currentDueDay.index + 1
                    }

                    // If Done AND Today is AFTER the current Due Date (or within 24 hours prior)...
                    if (today.isAfter(moment(obj.currentDueDay.date).utc().subtract(1, 'days'))) {
                        // ... The we need to cycle the due date to the next day in the cycle.
                        // CYLE DAYS

                        let nextDayDue;
                        let nextAvailableDays;
                        //!!!!!!!!!!!!!! PROBLEM!! I probably need to also check here that it's not the same day as the current exisiting due day ???
                        // Find the next available days that the chore can be assigned to in this week, if any exists...
                        nextAvailableDays = obj.daysDue.filter(day => { // I think this this can be a find. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                            const dayInDaysDueArray = today.day(day, 'day').format('YYYY-MM-DD') // This is the day of the current week of those daysDue values
                            console.log('dayInDaysDueArray: ', dayInDaysDueArray);
                            

                            // If the day is After the current due date...
                            if (moment(dayInDaysDueArray).isAfter(obj.currentDueDay.date, 'day')) {
                                // ... And is the SAME OR is AFTER Today
                                // !!!!!!! Check if we can get rid of isSame here...
                                console.log('first if');
                                
                                if (moment(dayInDaysDueArray).isSame(today, 'day') || moment(dayInDaysDueArray).isAfter(today, 'day')) {
                                    console.log('returntrue');
                                    
                                    return true
                                }
                            }
                        })
                        console.log('!!!!!!!!!!! Next available days: ', nextAvailableDays);
                        
                        // ... If there are days available, set the nextDayDue value to then next day available
                        if (nextAvailableDays.length > 0) {
                            nextDayDue = today.day(nextAvailableDays[0], 'day');
                        } else {
                            // Otherwise, if Today is AFTER the day of the week of the (only) daysDue value, add one week.
                            console.log('!?!?!?!', today.day(obj.daysDue[0], 'day'));
                            
                            console.log('???????', today.isAfter(today.day(obj.daysDue[0], 'day')));
                            
                            if (today.isAfter(today.day(obj.daysDue[0], 'day'))) {
                                console.log('OTHERWISE: ', today.isAfter(today.day(obj.daysDue[0], 'day')));
                                nextDayDue = today.add(1, 'weeks').day(obj.daysDue[0], 'day');
                                console.log('... ', nextDayDue);
                                
                            } else {
                                // ... Otherwise, just keep it as it is/was, ... !! Check this - I don't think it'll ever hit?
                                nextDayDue = today.day(obj.daysDue[0], 'day')
                                console.log('else: ', nextDayDue);
                                
                            }
                        }

                        obj.currentDueDay.date = nextDayDue.format("YYYY-MM-DD")
                        obj.currentDueDay.index = nextDaysDueIndex

                        obj.done = false

                        // CYCLE HOUSEMATES
                        let nextCycle = 0

                        // If there are multiple people in the cycle, and we're not at the end of the array, increase the upcoming index by one.
                        if (obj.cycle.length > 1 && obj.cycle[obj.currentAssigned.index + 1]) {
                            nextCycle = obj.currentAssigned.index + 1;
                        }

                        obj.currentAssigned.index = nextCycle
                        obj.currentAssigned.uid = obj.cycle[nextCycle].uid;
                        obj.currentAssigned.name = users.find(user => (user.uid === obj.currentAssigned.uid)).name;

                        // CYCLE UPCOMING
                        let upcomingCycle = 0

                        // Get the Index of the next due day
                        if (obj.cycle.length > 1 && obj.cycle[obj.currentAssigned.index + 1]) {
                            upcomingCycle = obj.currentAssigned.index + 1;
                        }

                        obj.upcoming.index = upcomingCycle
                        obj.upcoming.uid = obj.cycle[upcomingCycle].uid
                        obj.upcoming.name = users.find(user => (user.uid === obj.upcoming.uid)).name
                    }
                }

                // Once done is false
                console.log('Current Due Day: ', obj.currentDueDay.date);
                let currDay = today.format('YYYY-MM-DD')

                // Stringify daysDue, cycle, and upcoming for postgres
                obj.daysDue = JSON.stringify(obj.daysDue)
                obj.cycle = JSON.stringify(obj.cycle)
                obj.upcoming = JSON.stringify(obj.upcoming)

                db('chores').where({ id: obj.id }).update(obj).then((res) => {
                    console.log('end algorithm, post update', res);
                }).catch(err => console.error('ERROR in end algorithm post:', err))
            })

            console.log('after');
            console.log(allChores);

            db('chores').where({ house_id: 1 }).then(result => {
                console.log('DONE - ready to send JSON');
                console.log(result);
                res.json(result)
            })

        })
    })
});

router.put('/done/:id', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;
    let choreId = req.params.id

    db('chores').where({ id: choreId }).update({ done: true }).returning('*').then(updatedChore => {
        res.json(updatedChore);
    });
});

router.put('/edit-chore/:id', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;
    let editedChore = req.body
    let choreId = req.params.id

    db('users_chores').where({ chore_id: choreId }).del().then(()=> {
        db('chores').where({ id: choreId }).update(editedChore).returning('*').then(updatedChore => {
            updatedChore[0].cycle.forEach(user => {
                console.log('cycle.forEach user', user);
                
                db('users_chores').insert({user_id: user.id, chore_id: updatedChore[0].id}).then(() => {
                    console.log('posted to join');
                    res.json(updatedChore);
                })
            })
        })
    })
});

module.exports = router;
