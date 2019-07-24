var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require("multer");
var thumbManager = require('../upload/ThumbManager').getInstance();
var currentList = [];
var currentHash = '';

router.get('/', function (req, res, next) {
  console.log(req.url);
  var param = {
    url: req.url,
    command: req.query.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

router.get('/files', function (req, res, next) {
  console.log(req.url);
  var files = fs.readdirSync('./public/slideshow/files');
  var tempList = files.filter(function (file) {
    if (file.toLocaleLowerCase().lastIndexOf('.jpg') == file.length - '.jpg'.length) {
      return true;
    } else {
      return false;
    }
  });
  var hash = getHash(tempList);

  if (currentHash == hash) {
    //console.log('****onnaji');
  } else {
    currentHash = hash;
    var list = [];
    var n = tempList.length;
    for (var i = 0; i < n; i++) {
      var url = tempList[i];
      list[i] = {
        url: url,
        duration: getDuration(url)
      }
    }
    currentList = list;
  }

  var param = {
    url: req.url,
    list: currentList
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

function getHash(list) {
  list.sort();
  var hash = '';
  var n = list.length;
  for (var i = 0; i < n; i++) {
    hash += list[i];
  }
  return hash;
}

var getDuration = function (url) {
  var n = currentList.length;
  for (var i = 0; i < n; i++) {
    if (currentList[i].url == url) {
      return currentList[i].duration;
    }
  }
  return 10;
}

//https://github.com/expressjs/multer
var storage = multer.diskStorage({
  // ファイルの保存先を指定
  destination: function (req, file, cb) {
    console.log("destination", req.params.command);
    var filepath = 'public/slideshow/files';
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
  res.json({
    result: 'success',
    query: req.query,
    body: req.body,
    pathlist: pathlist
  });
}

// command のディレクトリ内に保存
router.post('/files', upload.array('upfile'), thumb_res);

router.post('/list', function (req, res, next) {
  console.log(req.url);
  console.dir(JSON.parse(req.body.list));
  var tempList = JSON.parse(req.body.list);
  var list = [];
  var n = tempList.length;
  for (var i = 0; i < n; i++) {
    list.push(tempList[i].url);
  }
  n = currentList.length;
  for (var i = 0; i < n; i++) {
    if (!isContain(list, currentList[i].url)) {
      fs.unlink('./public/slideshow/files/' + currentList[i].url, function (err) {
        if (err) throw err;
        //console.log('deleted', currentList[i].url);
      });
    }
  }
  currentList = tempList;
  currentHash = getHash(list);

  var param = {
    url: req.url,
    list: list
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

function isContain(list, str) {
  //console.log('isContain', str);
  var n = list.length;
  for (var i = 0; i < n; i++) {
    if (list[i] == str) {
      return true;
    }
  }
  return false;
}

module.exports = router;