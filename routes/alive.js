var express = require('express');
var aliveManager = require('./alive/AliveManager').getInstance();
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  //res.send('respond with a resource');
  var param = {
    status: 'success'
  };
  param.result = await aliveManager.getActive();

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);

});

module.exports = router;