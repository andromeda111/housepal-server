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

            allChores.forEach(obj => {
                console.log('init current due idx: ', obj.currentDueDay.index);
                console.log(obj.daysDue[obj.currentDueDay.index + 1]);
                console.log('IN OBJ');

                // PROBLEM: Chore does not remain "Done" until orignal duedate has passed.
                // Check if Chore is Done, and update/cycle
                // Get next index of daysDue
                if (obj.done) {
                    let nextDueIdx = 0
                    console.log('DAYS DUE LENGTH ', obj.daysDue.length);
                    // Get the Index of the next due day
                    if (obj.daysDue.length > 1) {
                        console.log('checking next idx');
                        if (!obj.daysDue[obj.currentDueDay.index + 1]) {
                            console.log('idx reset');
                            nextDueIdx = 0
                        } else {
                            console.log('idx +1');
                            nextDueIdx = obj.currentDueDay.index + 1
                        }
                    }
                    // If Today is after the current Due Date
                    console.log('is today after the curr due date: ', moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.date, 'day'));

                    if (moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.date, 'day')) {

                        // CYLE DAYS

                        let nextDayDue;
                        let nextDays;
                        nextDays = obj.daysDue.filter(day => {
                            // console.log('day in arr', moment(moment().add(0, 'day')).day(day,'day').format('YYYY-MM-DD'));
                            let blah = moment(moment().add(0, 'day')).day(day, 'day').format('YYYY-MM-DD')
                            if (moment(blah).isAfter(obj.currentDueDay.date, 'day') && moment(blah).isSame(moment(moment().add(0, 'day')), 'day') && !obj.late) {
                                return true
                            } else if (moment(blah).isAfter(obj.currentDueDay.date, 'day') && moment(blah).isAfter(moment(moment().add(0, 'day')), 'day')) {
                                return true
                            }
                        })

                        console.log('nextDays after set: ', nextDays);


                        if (nextDays.length > 0) {
                            nextDayDue = moment().add(0, 'day').day(nextDays[0], 'day')
                        } else {
                            console.log('check: ', moment(moment().add(0, 'day')).isAfter(moment(moment().add(0, 'day')).day(obj.daysDue[0], 'day')));
                            if (moment(moment().add(0, 'day')).isAfter(moment(moment().add(0, 'day')).day(obj.daysDue[0], 'day'))) {
                                nextDayDue = moment(moment().add(0, 'day')).add(1, 'weeks').day(obj.daysDue[0], 'day');
                            } else {
                                nextDayDue = moment().add(0, 'day').day(obj.daysDue[0], 'day')

                            }
                        }


                        obj.currentDueDay.date = nextDayDue.format("YYYY-MM-DD")
                        obj.currentDueDay.index = nextDueIdx

                        // If today is After the current due date:
                        if (moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.date, 'day')) {
                            console.log('today is after the due date');
                        } else {
                            obj.dueToday = false
                        }

                        obj.late = false
                        obj.done = false

                        // CYCLE HOUSEMATES
                        let nextCycle = 0
                        console.log('cycle length: ', obj.cycle.length);
                        // Get the Index of the next due day
                        if (obj.cycle.length > 1) {
                            console.log('checking next cycle idx');
                            if (!obj.cycle[obj.currentAssigned.index + 1]) {
                                console.log('idx reset');
                                nextCycle = 0
                            } else {
                                console.log('idx +1');
                                nextCycle = obj.currentAssigned.index + 1
                            }
                        }

                        obj.currentAssigned.index = nextCycle
                        obj.currentAssigned.uid = obj.cycle[nextCycle];
                        obj.currentAssigned.name = users.find(user => (user.uid === obj.currentAssigned.uid)).name;
                       
                        console.log('current assigned UID: ', obj.currentAssigned.uid);
                        console.log('current assigned name: ', obj.currentAssigned.name);

                        // Set upcoming cycle array
                        if (obj.cycle.length > 1) {
                            let pre = obj.cycle.slice(0, obj.currentAssigned.index);
                            let post = obj.cycle.slice(obj.currentAssigned.index + 1);
                            let upcoming = post.concat(pre);
                            obj.upcoming = upcoming.map(uid => {
                                let name = users.find(user => (user.uid === uid)).name;
                                return { uid, name };
                            })
                        }
                        console.log('upcoming', obj.upcoming);
                        
                    }
                    console.log('END of DONE currentDueDay: ', obj.currentDueDay.date);
                }

                // Once done is false
                console.log('Current Due Day: ', obj.currentDueDay.date);
                let currDay = moment().add(0, 'day').format('YYYY-MM-DD')
                if (obj.dueToday === false && obj.late === false) {
                    console.log('Not due today, and not late');
                    console.log(obj.currentDueDay.date);
                    console.log(currDay);
                    let result;
                    if (moment(currDay).isSame(obj.currentDueDay.date, 'day')) {
                        // console.log(moment().day(obj.currentDueDay.date, 'day'));
                        console.log('same day');
                        obj.dueToday = true
                    }
                    if (moment(currDay).isAfter(obj.currentDueDay.date, 'day')) {
                        obj.dueToday = true
                        obj.late = true
                    }
                }
                if (obj.dueToday === true && moment(currDay).isAfter(obj.currentDueDay.date, 'day')) {
                    obj.late = true
                }
                db('chores').where({ id: obj.id }).update(obj).then(() => { })
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

module.exports = router;
