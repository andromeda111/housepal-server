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
            // PROBLEM: Chore does not remain "Done" until orignal duedate has passed.
            // Check if Chore is Done, and update/cycle
            // TODO: Chore is "Done" if completed more than 24 hours before the UTC 0000 due date. Otherwise, jump to next due date.
            allChores.forEach(obj => {
                console.log('non-utc', moment())
                console.log('utc', moment().hour(0));
                
                
                // If a chore is marked as Done.
                if (obj.done) {
                    // If we're at the end of the array, jump back to the zero index. Otherwise, increase by one.
                    let nextDaysDueIndex = 0

                    if (obj.daysDue.length > 1 && obj.daysDue[obj.currentDueDay.daysDueIndex + 1]) {
                        nextDaysDueIndex = obj.currentDueDay.daysDueIndex + 1
                    }
                    console.log('Due day - one day: ', moment(obj.currentDueDay.date).utc().hour(0).subtract(1, 'days'));
                    
                    // If Done AND Today is AFTER the current Due Date (or within 24 hours prior)...
                    if (moment().utc().isAfter(moment(obj.currentDueDay.date).utc().hour(0).subtract(1, 'days'))) {
                        console.log('done and after');
                        
                        // ... The we need to cycle the due date to the next day in the cycle.
                        // CYLE DAYS

                        let nextDayDue;
                        let nextAvailableDays;
                        //!!!!!!!!!!!!!! PROBLEM!! I probably need to also check here that it's not the same day as the current exisiting due day ???
                        // Find the next available days that the chore can be assigned to in this week, if any exists...
                        nextAvailableDays = obj.daysDue.filter(day => { // I think this this can be a find. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                            const dayInDaysDueArray = moment().utc().day(day, 'day').format('YYYY-MM-DD') // This is the day of the current week of those daysDue values
                            console.log('dayInDaysDueArray: ', dayInDaysDueArray);
                            

                            // If the day is After the current due date...
                            if (moment(dayInDaysDueArray).isAfter(obj.currentDueDay.date, 'day')) {
                                // ... And is the SAME OR is AFTER Today
                                // !!!!!!! Check if we can get rid of isSame here...
                                console.log('first if');
                                
                                if (moment(dayInDaysDueArray).isSame(moment().utc(), 'day') || moment(dayInDaysDueArray).isAfter(moment().utc(), 'day')) {
                                    console.log('returntrue');
                                    
                                    return true
                                }
                            }
                        })
                        console.log('!!!!!!!!!!! Next available days: ', nextAvailableDays);
                        console.log('halfway today', moment().utc());
                        
                        // ... If there are days available, set the nextDayDue value to then next day available
                        if (nextAvailableDays.length > 0) {
                            nextDayDue = moment().utc().day(nextAvailableDays[0], 'day');
                        } else {
                            // Otherwise, we need to restart the cycle.
                            // ... If Today is AFTER the day of the week of the (only) daysDue value - based on the CURRENT week, add one week.
                            console.log('!?!?!?!', moment().utc().day(obj.daysDue[0], 'day'));
                            
                            console.log('???????', moment().utc().isAfter(moment().utc().day(obj.daysDue[0], 'day')));
                            console.log('today: ', moment().utc());
                            
                            if (moment().utc().isAfter(moment().utc().day(obj.daysDue[0], 'day'))) {
                                // If it is the SAME day as the current due date > then bump up to next time (either index +1 or 2 weeks later)
                                if (moment().utc().isSame(moment().utc().day(obj.daysDue[0], 'day'), 'day')) {
                                    nextDayDue = obj.daysDue[1] ? moment().utc().add(1, 'weeks').day(obj.daysDue[1], 'day') : moment().utc().add(2, 'weeks').day(obj.daysDue[0], 'day');
                                }
                                // Otherwise, just bump up one week
                                console.log('OTHERWISE: ', moment().utc().isAfter(moment().utc().day(obj.daysDue[0], 'day')));
                                nextDayDue = moment().utc().add(1, 'weeks').day(obj.daysDue[0], 'day');
                                console.log('... ', nextDayDue);
                                
                            } else {
                                // ... Otherwise, just keep it as it is/was, ... !! Check this - I don't think it'll ever hit?
                                nextDayDue = moment().utc().day(obj.daysDue[0], 'day')
                                console.log('else: ', nextDayDue);
                                
                            }
                        }

                        obj.currentDueDay.date = nextDayDue.format("YYYY-MM-DD")
                        obj.currentDueDay.daysDueIndex = nextDaysDueIndex

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
