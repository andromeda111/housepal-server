const firebaseAdmin = require('firebase-admin');

function checkAuthorization(req, res, next) {
    let authToken = '';
    console.log('req.headers: ', req.headers);
    
    // Get the Auth Token from the Request Headers.
    if (req.headers && req.headers.authorization) {
        let tokenBearer = req.headers.authorization.split(' ');
        authToken = tokenBearer[1] ? tokenBearer[1].toString() : ''; 
    } else {
        // Error: No Authorization Token in Header. Return Error to client.
        console.error('Error: No Auth Token in HTTP Header');
        res.status(401).json({success: false, error: 'Not Authorized. Please Sign In.'});
        return;
    }

    // Verify Auth Token Status with Firebase
    firebaseAdmin.auth().verifyIdToken(authToken)
    .then(decodedToken => {
        // Token valid. Send on the decoded Token.
        req.locals = {decodedToken};
        next();
    })
    .catch(error => {
        // Error verifying token. Return Error to client.
        console.log("Error verifying token:", error);
        res.status(401).json({success: false, error});
    });
}

module.exports = checkAuthorization;