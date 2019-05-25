var express = require('express');
var router = express.Router();
var accountManager = require('./account/AccountManager').getInstance();

//router.get('/', function (req, res, next) {});

router.get('/login.js', function (req, res, next) {
  var js = "";
  if (accountManager.contain(req.cookies.account)) {
    js = "const login = true;";
  } else {
    js = "const login = false;";
  }
  res.header('Content-Type', 'text/javascript; charset=utf-8');
  res.send(js);
});

router.post('/login', function (req, res, next) {
  var param = {};
  try {
    var json = JSON.stringify(req.body);
    if (accountManager.contain(json)) {
      param.status = 'success';
      res.cookie('account', json, {
        maxAge: accountManager.maxAge
      });
    } else {
      param.status = 'ng';
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