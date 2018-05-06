const express = require('express');
const router = express.Router();
const db = require('../db')
const checkAuthorization = require('../services/check-auth.middleware')
const moment = require('moment');

router.get('/chores', checkAuthorization, function (req, res, next) {
    const decodedToken = req.locals.decodedToken;
    const uid = decodedToken.uid;

    let allChores = []
    db('chores').where({ house_id: 1 }).then(result => {

        allChores = result

        allChores.forEach(obj => {
            console.log('init current due idx: ', obj.currentDueDay.currentDueIdx);
            console.log(obj.daysDue.daysDue[obj.currentDueDay.currentDueIdx + 1]);
            console.log('IN OBJ');

            // PROBLEM: Chore does not remain "Done" until orignal duedate has passed.
            // Check if Chore is Done, and update/cycle
            // Get next index of daysDue
            if (obj.done) {
                let nextDueIdx = 0
                console.log('DAYS DUE LENGTH ', obj.daysDue.daysDue.length);
                // Get the Index of the next due day
                if (obj.daysDue.daysDue.length > 1) {
                    console.log('checking next idx');
                    if (!obj.daysDue.daysDue[obj.currentDueDay.currentDueIdx + 1]) {
                        console.log('idx reset');
                        nextDueIdx = 0
                    } else {
                        console.log('idx +1');
                        nextDueIdx = obj.currentDueDay.currentDueIdx + 1
                    }
                }
                // If Today is after the current Due Date
                console.log('is today after the curr due date: ', moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.currentDueDay, 'day'));

                if (moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.currentDueDay, 'day')) {

                    // CYLE DAYS

                    let nextDayDue;
                    let nextDays;
                    nextDays = obj.daysDue.daysDue.filter(day => {
                        // console.log('day in arr', moment(moment().add(0, 'day')).day(day,'day').format('YYYY-MM-DD'));
                        let blah = moment(moment().add(0, 'day')).day(day, 'day').format('YYYY-MM-DD')
                        if (moment(blah).isAfter(obj.currentDueDay.currentDueDay, 'day') && moment(blah).isSame(moment(moment().add(0, 'day')), 'day') && !obj.late) {
                            return true
                        } else if (moment(blah).isAfter(obj.currentDueDay.currentDueDay, 'day') && moment(blah).isAfter(moment(moment().add(0, 'day')), 'day')) {
                            return true
                        }
                    })

                    console.log('nextDays after set: ', nextDays);


                    if (nextDays.length > 0) {
                        nextDayDue = moment().add(0, 'day').day(nextDays[0], 'day')
                    } else {
                        console.log('check: ', moment(moment().add(0, 'day')).isAfter(moment(moment().add(0, 'day')).day(obj.daysDue.daysDue[0], 'day')));
                        if (moment(moment().add(0, 'day')).isAfter(moment(moment().add(0, 'day')).day(obj.daysDue.daysDue[0], 'day'))) {
                            nextDayDue = moment(moment().add(0, 'day')).add(1, 'weeks').day(obj.daysDue.daysDue[0], 'day');
                        } else {
                            nextDayDue = moment().add(0, 'day').day(obj.daysDue.daysDue[0], 'day')

                        }
                    }


                    obj.currentDueDay.currentDueDay = nextDayDue.format("YYYY-MM-DD")
                    obj.currentDueDay.currentDueIdx = nextDueIdx

                    // If today is After the current due date:
                    if (moment(moment().add(0, 'day')).isAfter(obj.currentDueDay.currentDueDay, 'day')) {
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
                        if (!obj.cycle[obj.currentAssigned + 1]) {
                            console.log('idx reset');
                            nextCycle = 0
                        } else {
                            console.log('idx +1');
                            nextCycle = obj.currentAssigned + 1
                        }
                    }

                    obj.currentAssigned = nextCycle
                }
                console.log('END of DONE currentDueDay: ', obj.currentDueDay.currentDueDay);
            }

            // Once done is false
            console.log('Current Due Day: ', obj.currentDueDay.currentDueDay);
            let currDay = moment().add(0, 'day').format('YYYY-MM-DD')
            if (obj.dueToday === false && obj.late === false) {
                console.log('Not due today, and not late');
                console.log(obj.currentDueDay.currentDueDay);
                console.log(currDay);
                let result;
                if (moment(currDay).isSame(obj.currentDueDay.currentDueDay, 'day')) {
                    // console.log(moment().day(obj.currentDueDay.currentDueDay, 'day'));
                    console.log('same day');
                    obj.dueToday = true
                }
                if (moment(currDay).isAfter(obj.currentDueDay.currentDueDay, 'day')) {
                    obj.dueToday = true
                    obj.late = true
                }
            }
            if (obj.dueToday === true && moment(currDay).isAfter(obj.currentDueDay.currentDueDay, 'day')) {
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
});

module.exports = router;