const express = require('express');
const router = express.Router();
const db = require('../db');
const firebaseAdmin = require('firebase-admin');
const checkAuthorization = require('../services/check-auth.middleware');

router.post('/create', checkAuthorization, function(req, res, next) {
	const decodedToken = req.locals.decodedToken;
	const uid = decodedToken.uid;
	const newHouse = req.body;

	db('houses')
		.insert(newHouse)
		.returning('*')
		.then(result => {
			const houseID = result[0].id;
			const newLaundry = {
				washer_status: false,
				washer_start_time: { time: null },
				washer_current_user: { id: null, name: null },
				washer_notify: { users: null },
				dryer_status: false,
				dryer_start_time: { time: null },
				dryer_current_user: { id: null, name: null },
				dryer_notify: { users: null },
				house_id: houseID
			};
			db('laundry')
				.insert(newLaundry)
				.returning('*')
				.then(result => {
					console.log('New laundry created.');
					db('users')
						.update({ house_id: houseID })
						.where({ uid })
						.returning('*')
						.then(user => {
							res.status(200).send({
								success: true,
								msg: 'House successfully created.',
								houseID: houseID
							});
						});
				});
		})
		.catch(err => {
			res.status(400).send({
				success: false,
				msg: 'Try again; house already exists.',
				err
			});
		});
});

router.post('/join', checkAuthorization, function(req, res, next) {
	const decodedToken = req.locals.decodedToken;
	const uid = decodedToken.uid;

	const house = req.body;

	db('houses')
		.where(house)
		.then(result => {
			if (!result[0]) {
				err();
			} else {
				const houseID = result[0].id;
				db('users')
					.update({ house_id: houseID })
					.where({ uid })
					.returning('*')
					.then(user => {
						res.status(200).send({
							success: true,
							msg: 'House successfully joined.',
							houseID: user.house_id
						});
					});
			}
		})
		.catch(() => {
			res.status(400).send({ success: false, msg: 'Try again; house does not exist.' });
		});
});

module.exports = router;
