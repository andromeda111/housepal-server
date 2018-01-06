var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const admin = require('firebase-admin');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/create', function(req, res, next) {

    console.log('body', req.body);

    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully created new user:", userRecord);
            console.log('user: ', userRecord);
            res.status(200).json({success: true, uid: userRecord})
        })
        .catch(function(error) {
            console.log("Error creating new user:", error);
            res.status(200).json({success: false, error})
        });

});

router.post('/signin', function(req, res, next) {

    console.log('body', req.body);

    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(userRecord) {
            userRecord.getIdToken().then(token => {
                res.status(200).json({success: true, token})
            })
        })
        .catch(function(error) {
            console.log("Error signing in:", error);
            res.status(200).json({success: false, error})
        });
});

router.post('/verify', function(req, res, next) {

    console.log('body', req.body.token);

    admin.auth().verifyIdToken(req.body.token)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            res.status(200).json({success: true, uid, msg: 'authorize, bruh!'})
            console.log();
        })
        .catch(function(error) {
            console.log("Error verifying token:", error);
            res.status(200).json({success: false, error})
        });
});





module.exports = router;
