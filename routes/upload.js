var express = require('express');
var router = express.Router();
var multer = require("multer");
var fs = require('fs');
var thumbManager = require('./upload/ThumbManager').getInstance();

//https://github.com/expressjs/multer
var storage = multer.diskStorage({
  // ファイルの保存先を指定
  destination: function (req, file, cb) {
    console.log("destination");
    var filepath = 'public/upload/upfile';
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

router.post('/', upload.array('upfile'), async function (req, res) {
  console.log('upfile');

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
      } else if (upfileObj.mimetype == "image/jpeg" || upfileObj.mimetype == "image/png") {
        path = await thumbManager.image(upfileObj, req.query);
      }
      pathlist.push(path);
    }

  }

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json({
    result: 'success',
    query: req.query,
    body: req.body,
    pathlist: pathlist
  });
});


module.exports = router;