var express = require('express');
var router = express.Router();
var accountManager = require('./AccountManager').getInstance();

//router.get('/', function (req, res, next) {});

router.get('/account.js', function (req, res, next) {
  var js = "";
  var obj = accountManager.contain(req.cookies.account);
  if (obj == undefined) {
    js = "const account = undefined;";
  } else {
    js = "const account = " + JSON.stringify(obj) + ";";
    // 期限のアップデート
    res.cookie('account', req.cookies.account, {
      maxAge: accountManager.maxAge
    });
  }
  res.header('Content-Type', 'text/javascript; charset=utf-8');
  res.send(js);
});

router.post('/login', function (req, res, next) {
  var param = {};
  try {
    var json = JSON.stringify(req.body);
    var obj = accountManager.contain(json);
    if (obj == undefined) {
      param.status = 'ng';
    } else {
      param.status = 'success';
      param.account = obj;
      res.cookie('account', json, {
        maxAge: accountManager.maxAge
      });
    }
  } catch (e) {
    param.status = 'ng';
  }
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.post('/signup', function (req, res, next) {
  var param = accountManager.create(req.body);
  if (param.status == 'success') {
    var account = {};
    account.id = req.body.id;
    account.pw = req.body.pw;
    res.cookie('account', JSON.stringify(account), {
      maxAge: accountManager.maxAge
    });
  }
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

module.exports = router;