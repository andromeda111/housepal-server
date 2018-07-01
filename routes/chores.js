const express = require('express');
const router = express.Router();
const db = require('../db')
const checkAuthorization = require('../services/check-auth.middleware')
const moment = require('moment');

router.get('/chores', checkAuthorization, function (req, res, next) {
    const decodedToken = req.locals.decodedToken;
    const uid = decodedToken.uid;

    let allChores = [];

    db('chores').where({ house_id: 1 }).then(result => {

        allChores = result
        // PROBLEM: Chore does not remain "Done" until orignal duedate has passed.
        // Check if Chore is Done, and update/cycle
        // TODO: Chore is "Done" if completed more than 24 hours before the UTC 0000 due date. Otherwise, jump to next due date.
        allChores.forEach(obj => {
            console.log('non-utc', moment())
            console.log('utc', moment().hour(0));
            
            // If a chore is marked as Done AND Today is AFTER the current Due Date (or within 24 hours prior)...
            if (obj.done && moment().utc().isAfter(moment(obj.currentDueDay.date).utc().hour(0).subtract(1, 'days'))) {
                console.log('!! Chore is done and after currentDueDay');
                // CYCLE DAYS... The we need to cycle the due date to the next day in the cycle.

                // UPDATE the daysDueIndex. If we're at the end of the array, jump back to the zero index. Otherwise, increase by one.
                // if (obj.daysDue.length === 1) {
                //     obj.currentDueDay.daysDueIndex = 0 // Doesn't change
                //     // date increases by 1 week...

                // }

                let nextDaysDueIndex = 0
                if (obj.daysDue.length > 1 && obj.daysDue[obj.currentDueDay.daysDueIndex + 1]) {
                    nextDaysDueIndex = obj.currentDueDay.daysDueIndex + 1
                } 
                console.log('Due day - one day: ', moment(obj.currentDueDay.date).utc().hour(0).subtract(1, 'days'));
                obj.currentDueDay.daysDueIndex = nextDaysDueIndex
            
                // Find the next available day (return index of daysDue array) that the chore can be assigned to in this week, if any exists...
                const nextAvailableDayIndex = obj.daysDue.find(day => {
                    const dayInDaysDueArray = moment().utc().day(day, 'day').format('YYYY-MM-DD') // This is the day of the current week of those daysDue values
                    
                    // Is the day we're checking After both the currentDueDay AND today -- then return true
                    if (moment(dayInDaysDueArray).isAfter(obj.currentDueDay.date, 'day') && moment(dayInDaysDueArray).isAfter(moment().utc(), 'day')) {
                        return true;
                    }
                })
                console.log('!!!!!!!!!!! Next available day: ', nextAvailableDayIndex);
                
                // ... If there are days available, set the nextDayDue value to then next day available
                let nextDayDue;
                
                if (nextAvailableDayIndex) {
                    nextDayDue = moment().utc().day(nextAvailableDayIndex, 'day');
                } else {
                    // Otherwise, we need to restart the cycle.
                    // ... If Today is AFTER the day of the week of the (first or only) daysDue value - based on the CURRENT week               
                    if (moment().utc().isAfter(moment().utc().day(obj.daysDue[0], 'day'))) {
                        console.log('OTHERWISE: ', moment().utc().isAfter(moment().utc().day(obj.daysDue[0], 'day')));                        
                        // EDGE CASE: Sat>Sun within 24hrs: If Today is the SAME day as the current due date > then bump up to next time (either index +1 or 2 weeks later)
                        if (moment().utc().isSame(moment().utc().day(obj.daysDue[0], 'day'), 'day')) {
                            if (obj.daysDue[1]) {
                                nextDayDue = moment().utc().add(1, 'weeks').day(obj.daysDue[1], 'day'); // Next available day in the next week.
                                console.log('EDGE CASE IF', nextDayDue);
                            } else {
                                nextDayDue = moment().utc().add(2, 'weeks').day(obj.daysDue[0], 'day'); // Skip extra week.
                                console.log('EDGE CASE ELSE', nextDayDue);                                
                            }
                        } else {
                            // NORMAL CASES: just bump up one week
                            nextDayDue = moment().utc().add(1, 'weeks').day(obj.daysDue[0], 'day');
                            console.log('NORMAL CASE ', nextDayDue);     
                        }                   
                    } else {
                        // ELSE... Keep as-is, the first day due is after today
                        nextDayDue = moment().utc().day(obj.daysDue[0], 'day')
                        console.log('main nextDayDue else: ', nextDayDue);
                    }
                }

                obj.currentDueDay.date = nextDayDue.format("YYYY-MM-DD")
                

                obj.done = false

                // CYCLE HOUSEMATES & UPCOMING
                // If there are multiple people in the cycle, AND we're not at the end of the array...                    
                if (obj.cycle.length > 1) {
                    // Cycle to next user in cycle, or back to start
                    const nextUserInCycle = obj.cycle[obj.currentAssigned.index + 1];
                    const upcomingUserInCycle = obj.cycle[nextUserInCycle.index + 1];

                    obj.currentAssigned = nextUserInCycle || obj.cycle[0];
                    obj.upcoming = upcomingUserInCycle || obj.cycle[0];
                }
            }

            // Once done is false
            console.log('Current Due Day: ', obj.currentDueDay.date);

            // Stringify Arrays: daysDue, cycle, for postgres
            obj.daysDue = JSON.stringify(obj.daysDue)
            obj.cycle = JSON.stringify(obj.cycle)

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
