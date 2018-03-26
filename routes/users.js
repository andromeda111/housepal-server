const express = require('express');
const router = express.Router();
const db = require('../db')
const firebaseAdmin = require('firebase-admin');
const checkAuthorization = require('../services/check-auth.middleware')

// GET Current Active User
router.get('/current', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    db('users').where({ uid })
        .then(result => {
            console.log('user: ', result);
            if (result[0]) {
                user = {
                    uid: result[0].uid,
                    name: result[0].name,
                    email: result[0].email,
                    houseID: result[0].house_id,
                    deviceID: result[0].device_id
                };
                res.status(200).json(user);
            } else {
                throw 'User not found';
            }
        })
        .catch(err => {
            console.error('ERROR retrieving user data: ', err);
            res.status(400).json(err);
            //TODO: Add Error Handling
        })
});

// GET Roommates
router.get('/roommates/:house_id', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;
    let houseID = req.params.house_id;
    console.log(decodedToken);

    db('users').select('uid', 'name', 'house_id as houseID')
        .where({ house_id: houseID })
        .whereNot({ uid })
        .then(roommates => {
            console.log('roommates: ', roommates);
            res.status(200).json(roommates);
        })
        .catch(err => {
            console.error('ERROR retrieving roommate data: ', err);
            res.status(400).json(err);
            //TODO: Add Error Handling
        })
});

// Remove Roommate
router.post('/remove-roommate', checkAuthorization, function(req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;
    let roommate = req.body;
    console.log('roommate body: ', roommate);
    

    db('users').update({house_id: null}).where({ uid: roommate.uid }).then(() => {
        db('chores').where({ house_id: roommate.houseID }).then(chores => {
            console.log('chores', chores);
            
            if (chores) {
                let choresWithUser = chores.filter(chore => {
                    return chore.cycle.cycleList.includes(roommate.uid);
                })
                console.log(choresWithUser);
                
                choresWithUser.forEach(chore => {
                    db('chores').where({id: chore.id}).del('*').then(() => {})
                })
            }
        })

        res.status(200).json({msg: 'success!!'})
    })
  });

// Sign In
router.post('/signin', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    let user = {};

    db('users').where({ email, password })
        .then(result => {
            console.log('user: ', result);
            if (result[0]) {
                user = {
                    uid: result[0].uid,
                    name: result[0].name,
                    email: result[0].email,
                    houseID: result[0].house_id,
                    deviceID: result[0].device_id
                };

                res.status(200).json(user);
            } else {
                throw 'User not found';
            }
        })
        .catch(err => {
            console.log('Error signing in user: ', err);
            res.status(400).json(err);
            //TODO: Add Error Handling
        })
})

// Sign Up
router.post('/signup', async function (req, res, next) {
    let userCredentials = req.body;
    let newUser = {
        name: userCredentials.name,
        email: userCredentials.email,
        password: userCredentials.password,
        uid: ''
    };
    console.log(newUser);

    await firebaseAdmin.auth().createUser(userCredentials)
        .then(firebaseUser => {
            newUser.uid = firebaseUser.uid;
            console.log('newUser.uid set: ', newUser);
        })
        .catch(err => {
            console.log('ERROR Firebase Create User', err);
            res.status(500).json(err);
        })

    if (newUser.uid) {
        db('users').insert(newUser, '*')
            .then(result => {
                console.log('new user created and stored: ', result[0]);
                const user = {
                    id: result[0].id,
                    uid: result[0].uid,
                    name: result[0].name,
                    email: result[0].email,
                    houseID: result[0].house_id,
                    deviceID: result[0].device_id
                };

                res.status(200).json({ success: true, msg: 'Successful created new user: ', user });
            }).catch(err => {
                console.error('ERROR posting to Database ', err);
                firebaseAdmin.auth().deleteUser(newUser.uid).then(res => console.log('res from delete fb user', res))
                // if this fails, maybe on signin if one exists but not the other, just recreate the other?
                res.status(500).json(err)
            })
    }
});

module.exports = router;
