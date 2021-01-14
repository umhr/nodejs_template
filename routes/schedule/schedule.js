var express = require('express');
var scheduleManager = require('./ScheduleManager').getInstance();
var router = express.Router();

/* api?command=set&count=456 */
router.get('/', function (req, res, next) {
  console.log(req.url);
  var param = {
    url: 'schedule' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

router.get('/data', function (req, res, next) {
  console.log(req.url);
  var param = {
    data:scheduleManager.get(),
    url: 'schedule' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.post('/data', function (req, res, next) {
  console.log(req.url);
  scheduleManager.set(JSON.parse(req.body.payload).data);
  var param = {
    data:scheduleManager.get(),
    url: 'schedule' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

module.exports = router;