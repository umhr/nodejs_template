var express = require('express');
var iconv = require('iconv-lite');

var accessManager = require('./AccessManager').getInstance();
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/set', function (req, res, next) {
  const remoteAddress = req.connection.remoteAddress;
  const splittedAddress = remoteAddress.split(':');
  const ipAddress = splittedAddress[splittedAddress.length - 1];

  //console.dir(req.query);
  var param = {
    status: 'success',
    query: req.query
  };
  accessManager.set(req.query, ipAddress);
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/get', async function (req, res, next) {
  var data = {};
  var result = await accessManager.get(req.query, data);
  //console.dir(data);

  if (data.format == 'json') {
    var param = {
      status: 'success',
      query: req.query,
      result: await accessManager.get(req.query, data)
    };
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin: *');
    res.send(param);
  } else {
    var body;
    if (data.format == 'raw') {
      body = '_id,name,language,ipaddress,datetime' + '\n';
    } else if (data.format == 'csv') {
      body = 'name,language,count' + '\n';
    }
    var n = result.length;
    for (var i = 0; i < n; i++) {
      if (data.format == 'raw') {
        body += result[i]._id + ',' + result[i].name + ',' + result[i].language + ',' + result[i].ipaddress + ',' + result[i].datetime + '\n';
      } else if (data.format == 'csv') {
        body += result[i].name + ',' + result[i].language + ',' + result[i]['count(*)'] + '\n';
      }
    }
    var filename = data.startDate + '_' + data.endDate;
    if (data.format == 'csv') {
      filename += '_log.csv';
    } else if (data.format == 'raw') {
      filename += '_raw.csv';
    }
    var buf = iconv.encode(body, "Shift_JIS");
    res.header('Content-Type', 'application/force-download');
    res.header('Content-disposition', 'attachment; filename=\"' + filename + '\"');
    res.send(buf);
  }
});


module.exports = router;