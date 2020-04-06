var express = require('express');
var router = express.Router();
var waitinglistManager = require('./WaitinglistManager');
waitinglistManager.add('demo');

router.get('/:dir/data.json', function (req, res, next) {
  console.log(req.url);
  var param = {
    params: req.query.params,
    data: waitinglistManager.getInstance(req.params.dir).getData()
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.post('/:dir', function (req, res, next) {
  console.log(req.url);
  var item = JSON.parse(req.body.item);
  var param = {
    params: req.query.params,
    body: req.query.body,
    data: waitinglistManager.getInstance(req.params.dir).addItem(item)
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.put('/:dir/:id', function (req, res, next) {
  //console.log(req.url);
  var item = JSON.parse(req.body.item);
  //console.dir(item);
  var param = {
    params: req.query.params,
    body: req.query.body,
    data: waitinglistManager.getInstance(req.params.dir).setItem(req.params.id, item)
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.put('/:dir', function (req, res, next) {
  //console.log(req.url);
  var data = JSON.parse(req.body.data);
  //console.dir(item);
  var param = {
    params: req.query.params,
    body: req.query.body,
    data: waitinglistManager.getInstance(req.params.dir).setData(data)
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});


module.exports = router;