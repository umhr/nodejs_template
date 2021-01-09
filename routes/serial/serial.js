var express = require('express');
var serialManager = require('./SerialManager').getInstance();
var router = express.Router();

/* api?command=set&count=456 */
router.get('/', function (req, res, next) {
  console.log(req.url);
  var param = {
    command: req.query.command,
    url:req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

module.exports = router;