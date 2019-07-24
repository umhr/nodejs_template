var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require("multer");
var thumbManager = require('../upload/ThumbManager').getInstance();
var viewerManagerFactory = require('./ViewerManager');

router.get('/', function (req, res, next) {
  console.log(req.url);
  var param = {
    url: req.url,
    command: req.query.command,
    list: viewerManagerFactory.getList()
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/:dir/list', function (req, res, next) {
  console.log(req.url, req.params.dir);
  var name = req.params.dir;
  var viewerManager = viewerManagerFactory.getInstance(name);
  var tempList = viewerManager.getList();
  var param = {
    url: req.url,
    list: tempList
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

//https://github.com/expressjs/multer
var storage = multer.diskStorage({
  // ファイルの保存先を指定
  destination: function (req, file, cb) {
    console.log("destination", req.params.dir);
    var filepath = 'public/viewer/' + req.params.dir + '/assets';
    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isDirectory()) {
      fs.mkdirSync(filepath);
    }
    cb(null, filepath);
  },
  // ファイル名を指定(オリジナルのファイル名を指定)
  filename: function (req, file, cb) {
    console.log("filename");
    var date = new Date();
    var filename = date.getFullYear() + (date.getMonth() + 101).toString().substr(1) + (date.getDate() + 100).toString().substr(1) + (date.getHours() + 100).toString().substr(1) + (date.getMinutes() + 100).toString().substr(1) + (date.getSeconds() + 100).toString().substr(1);
    filename += "_" + file.originalname;
    cb(null, filename);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("fileFilter");
    cb(null, true);
  }
});

var thumb_res = async function (req, res) {
  if (req.body) {
    var object = req.body;
    for (const key in object) {
      console.log(key, object[key]);
    }
  }

  var pathlist = [];
  if (req.files) {
    var n = req.files.length;
    for (var i = 0; i < n; i++) {
      var upfileObj = req.files[i];
      var path = '';
      if (upfileObj.mimetype == "video/mp4") {
        path = await thumbManager.video(upfileObj, req.query);
        pathlist.push(path);
      } else if (upfileObj.mimetype == "image/jpeg" || upfileObj.mimetype == "image/png") {
        //path = await thumbManager.image(upfileObj, req.query);
      }
      //pathlist.push(path);
    }
  }

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.json({
    result: 'success',
    query: req.query,
    body: req.body,
    pathlist: pathlist
  });
}

router.post('/:dir/assets', upload.array('upfile'), thumb_res);

router.post('/:dir/list', function (req, res, next) {
  console.log(req.url);
  var name = req.params.dir;
  var viewerManager = viewerManagerFactory.getInstance(name);
  var list = viewerManager.setList(JSON.parse(req.body.list));

  var param = {
    url: req.url,
    list: list
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

module.exports = router;