const express = require('express');
const router = express.Router();
const checkAuthorization = require('../services/check-authorization.middleware')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/verify', checkAuthorization, function(req, res, next) {
    let decodedToken = req.locals.decodedToken;
    let uid = decodedToken.uid;

    res.status(200).json({success: true, uid, msg: 'authorize, bruh!'})
});

module.exports = router;
