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
                    id: result[0].id,
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
            console.error('ERROR retreiving user data: ', err);
            res.status(400).json(err);
            //TODO: Add Error Handling
        })
});

// GET Roommates
router.get('/roommates', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let houseID = decodedToken.houseID;
    console.log(decodedToken);

    db('users').select('uid', 'name', 'house_id as houseID').where({ house_id: houseID })
        .then(roommates => {
            console.log('roommates: ', roommates);
            if (roommates[0]) {
                res.status(200).json(roommates);
            } else {
                throw 'No roommates associated with this house ID';
            }
        })
        .catch(err => {
            console.error('ERROR retreiving roommate data: ', err);
            res.status(400).json(err);
            //TODO: Add Error Handling
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
                    id: result[0].id,
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
