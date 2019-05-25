var express = require('express');
var router = express.Router();
var setting = require('../Setting').getInstance();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Index'
  });
});

module.exports = router;