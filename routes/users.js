const express = require('express');
const router = express.Router();
const db = require('../db')
const checkAuthorization = require('../services/check-authorization.middleware')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/current', checkAuthorization, function(req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    db('users').where({ uid })
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.error('ERROR: ', err);
        //TODO: Add Error Handling
    })
});

router.post('/signup', function(req, res, next) {
    let newUser = req.body;

    db('users').insert(newUser, '*')
        .then((users) => {
            const user = users[0];
            console.log('new user created and stored: ', user);
            res.status(200).json({success: true, msg: 'Successful created new user: ', user});
        }).catch(err => {
            console.error('ERROR: ', err);
        })
});

router.post('/verify', checkAuthorization, function(req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    res.status(200).json({success: true, uid, msg: 'authorize, bruh!'})
});

module.exports = router;
