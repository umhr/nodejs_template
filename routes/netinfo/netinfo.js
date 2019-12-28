var express = require('express');
var netinfoManager = require('./NetinfoManager').getInstance();
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  //res.send('respond with a resource');
  var param = {
    status: 'success'
  };
  param.result = netinfoManager.getActive();
  param.progress = netinfoManager.progress;
  param.lastupdate = netinfoManager.lastupdate;

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/refresh', async function (req, res, next) {
  //res.send('respond with a resource');
  var param = {
    status: 'success'
  };
  netinfoManager.refresh();
  param.progress = netinfoManager.progress;
  param.lastupdate = netinfoManager.lastupdate;

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

module.exports = router;