const express = require('express');
const router = express.Router();
const db = require('../db');
const firebaseAdmin = require('firebase-admin');
const checkAuthorization = require('../services/check-auth.middleware');

// GET House
router.get('/id/:house_id', checkAuthorization, function (req, res, next) {
	let decodedToken = req.locals.decodedToken;
	let uid = decodedToken.uid;
	let houseID = req.params.house_id;

	db('houses').where({ id: houseID })
		.then(house => {
			if (house.length) {
				res.status(200).json(house[0])
			} else {
				throw 'No house found.';
			}
		})
		.catch(err => {
			console.error('ERROR:', err);
			const message = 'Unable to find this house. It may have been deleted. Please sign out and try again, or, create a new house.';
			res.status(400).json({ message });
		})
});

router.post('/create', checkAuthorization, function (req, res, next) {
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
							res.status(200).send({ houseID: houseID });
						});
				});
		})
		.catch(err => {
			console.error('ERROR: ', err); 
			const message = 'A house already exists with this name, or something went wrong while making it. Sorry! Please try a new name.';
			res.status(400).json({ message });
		});
});

router.post('/join', checkAuthorization, function (req, res, next) {
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
						res.status(200).send({ houseID: houseID });
					});
			}
		})
		.catch(err => {
			console.error('ERROR: ', err);
			const message = 'The house name or share code does not match. Please try again.';
			res.status(400).json({ message });
		});
});

module.exports = router;
