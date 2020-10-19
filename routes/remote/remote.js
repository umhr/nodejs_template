var express = require('express');
var remoteManager = require('./RemoteManager').getInstance();
var router = express.Router();

/* api?command=set&count=456 */
router.get('/', async function (req, res, next) {
  console.log(req.url);
  var param = {
    url: 'remote' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/data/:command', async function (req, res, next) {
  console.log(req.url);
  var param = {
    url: 'remote' + req.url
  };
  if(req.params.command == 'cleanup'){
    await remoteManager.cleanup();
  }else{
    param['list'] = await remoteManager.list()
  }

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/process/:filename', async function (req, res, next) {
  console.log(req.url);
  var echo = await remoteManager.process(req.params.filename);
  var param = {
    url: 'remote' + req.url,
    echo:echo
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/process/:filename/:param', async function (req, res, next) {
  console.log(req.url);
  //console.log(req.params.param);
  // req.params.paramで渡すとurlデコード済みで渡してしまうのをさけるため。
  // ps1内でデコードした方が確実なので。
  var param = req.url.substr(req.url.lastIndexOf("/")+1);
  var echo = await remoteManager.process(req.params.filename, param);
  var param = {
    url: 'remote' + req.url,
    echo:echo
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

process.on("exit", function () {
  remoteManager.exit();
});
process.on("SIGINT", function () {
  process.exit(0);
});

module.exports = router;