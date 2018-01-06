const express = require('express');
const router = express.Router();
const firebaseAdmin = require('firebase-admin');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/verify', function(req, res, next) {

    firebaseAdmin.auth().verifyIdToken(req.body.token)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            res.status(200).json({success: true, uid, msg: 'authorize, bruh!'})
        })
        .catch(function(error) {
            console.log("Error verifying token:", error);
            res.status(200).json({success: false, error})
        });
});





module.exports = router;
