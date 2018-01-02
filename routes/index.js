var express = require('express');
var router = express.Router();
const db = require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
  db('users').then(result => {
    console.log(result);
    res.json(result);
  })
});

module.exports = router;
