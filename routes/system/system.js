var express = require('express');
var systemManager = require('./SystemManager').getInstance();
var thumbManager = require('../upload/ThumbManager').getInstance();
var router = express.Router();
var multer = require("multer");
var fs = require('fs');


/* api?command=set&count=456 */
router.get('/', function (req, res, next) {
  console.log(req.url);

  var param = {
    url: 'system' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

router.get('/data', function (req, res, next) {
  console.log(req.url);
  var param = {
    data: systemManager.getData(),
    url: 'system' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.post('/data', function (req, res, next) {
  console.log(req.url);
  systemManager.setData(JSON.parse(req.body.payload).data);
  var param = {
    data: systemManager.getData(),
    url: 'system' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

router.get('/save', function (req, res, next) {
  console.log(req.url);
  systemManager.save();
  var param = {
    data: systemManager.getData(),
    url: 'system' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

var storage = multer.diskStorage({
  // ファイルの保存先を指定
  destination: function (req, file, cb) {
    //console.log("destination", req.params.command);
    var filepath = 'public/system/upload';
    if (req.params.command != undefined) {
      filepath += '/' + req.params.command;
    }
    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isDirectory()) {
      fs.mkdirSync(filepath);
    }
    cb(null, filepath);
  },
  // ファイル名を指定(オリジナルのファイル名を指定)
  filename: function (req, file, cb) {
    //console.log("filename");
    var date = new Date();
    var filename = date.getFullYear() + (date.getMonth() + 101).toString().substr(1) + (date.getDate() + 100).toString().substr(1) + (date.getHours() + 100).toString().substr(1) + (date.getMinutes() + 100).toString().substr(1) + (date.getSeconds() + 100).toString().substr(1);
    filename += "_" + file.originalname;
    cb(null, filename);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    //console.log("fileFilter");
    cb(null, true);
  }
});

var thumb_res = async function (req, res) {
  //console.log('thumb_res');
  if (req.body) {
    var object = req.body;
    for (const key in object) {
      console.log(key, object[key]);
    }
  }
  var senddata = [];
  var pathlist = [];
  if (req.files) {
    var n = req.files.length;
    for (var i = 0; i < n; i++) {
      var upfileObj = req.files[i];
      var path = '';
      if (upfileObj.mimetype == "video/mp4") {
        path = await thumbManager.video(upfileObj, req.query);
      } else if (upfileObj.mimetype == "image/jpeg" || upfileObj.mimetype == "image/png") {
        path = await thumbManager.image(upfileObj, req.query);
      }
      pathlist.push(path);
      senddata.push(upfileObj);
      //console.dir(upfileObj);
    }
  }

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json({
    result: 'success',
    query: req.query,
    body: req.body,
    pathlist: pathlist,
    senddata: senddata
  });
}

router.post('/upload', upload.array('upfile'), thumb_res);

router.delete('/upload', function (req, res, next) {
  console.log(req.url);
  systemManager.cleanup();
  var param = {
    data: systemManager.getData(),
    url: 'system' + req.url
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

process.on("exit", function () {
  systemManager.exit();
});
process.on("SIGINT", function () {
  process.exit(0);
});

module.exports = router;