const express = require('express');
const router = express.Router();
const db = require('../db')
const firebaseAdmin = require('firebase-admin');
const checkAuthorization = require('../services/check-auth.middleware')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/current', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    db('users').where({ uid })
        .then(user => {
            console.log('user: ', user);
            if (user[0]) {
                res.status(200).json(user[0]);
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

router.post('/signin', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    db('users').where({ email, password })
        .then(user => {
            console.log('user: ', user);
            if (user[0]) {
                res.status(200).json(user[0]);
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

router.post('/signup', async function (req, res, next) {
    let userCredentials = req.body;
    let newUser = {
        name: userCredentials.name,
        email: userCredentials.email,
        password: userCredentials.password,
        uid: ''
    }
    console.log(newUser);

    await firebaseAdmin.auth().createUser(userCredentials)
        .then(firebaseUser => {
            newUser.uid = firebaseUser.uid;
            console.log('newUser.uid set: ', newUser);
        })
        .catch(err => {
            console.log('ERROR Firebase Create User', err);
            res.status(500).json(err)
        })

    if (newUser.uid) {
        db('users').insert(newUser, '*')
            .then(result => {
                const user = result[0];
                console.log('new user created and stored: ', user);
                res.status(200).json({ success: true, msg: 'Successful created new user: ', user });
            }).catch(err => {
                console.error('ERROR posting to Database ', err);
                firebaseAdmin.auth().deleteUser(newUser.uid).then(res => console.log('res from delete fb user', res))
                // if this fails, maybe on signin if one exists but not the other, just recreate the other?
                res.status(500).json(err)
            })
    }
});

router.post('/verify', checkAuthorization, function (req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    res.status(200).json({ success: true, uid, msg: 'authorize, bruh!' })
});

module.exports = router;
