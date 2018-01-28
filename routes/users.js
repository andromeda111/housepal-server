const express = require('express');
const router = express.Router();
const db = require('../db')
const firebaseAdmin = require('firebase-admin');
const checkAuthorization = require('../services/check-auth.middleware')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// router.get('/current', checkAuthorization, function(req, res, next) {
//     let decodedToken = req.locals.decodedToken;
//     let uid = decodedToken.uid;

//     db('users').where({ uid })
//     .then(result => {
//         res.status(200).json(result);
//     })
//     .catch(err => {
//         console.error('ERROR: ', err);
//         //TODO: Add Error Handling
//     })
// });

router.post('/signin', function(req, res, next) {
    let email = req.body.email;
    let h_pw = req.body.password;

    db('users').where({ email, h_pw })
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            console.log('Error signing in user: ', err);
            res.json(err);
            //TODO: Add Error Handling
        })

})

router.post('/signup', async function(req, res, next) {
    let userEmailPassword = req.body;
    let newUser = {
        email: userEmailPassword.email,
        h_pw: userEmailPassword.h_pw,
        uid: ''
    }
    console.log(newUser);

    await firebaseAdmin.auth().createUser(userEmailPassword)
        .then(firebaseUser => {
            newUser.uid = firebaseUser.uid;
            console.log('newUser.uid set: ', newUser);
        })
        .catch(err => {
            console.log('ERROR Firebase Create User', err);
            res.status(500).json(err)
        })

    console.log('after firebase');

    db('users').insert(newUser, '*')
        .then(result => {
            console.log('result of db: ', result);
            const user = result[0];
            console.log('new user created and stored: ', user);
            res.status(200).json({success: true, msg: 'Successful created new user: ', user});
        }).catch(err => {
            console.error('ERROR posting to Database ', err);
            es.status(500).json(err)
        })
});

// router.post('/signup', function(req, res, next) {
//     let newUser = req.body;

//     db('users').insert(newUser, '*')
//         .then((users) => {
//             const user = users[0];
//             console.log('new user created and stored: ', user);
//             res.status(200).json({success: true, msg: 'Successful created new user: ', user});
//         }).catch(err => {
//             console.error('ERROR: ', err);
//         })
// });

router.post('/verify', checkAuthorization, function(req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    res.status(200).json({success: true, uid, msg: 'authorize, bruh!'})
});

module.exports = router;
