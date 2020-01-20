var express = require('express');
var router = express.Router();
var fs = require('fs');
const path = require('path');
const qrCode = require('qrcode');
var base = 'public/qrcode/';

// remove('all');

/* GET users listing. */
router.get('/', function (req, res, next) {
  var param = {
    status: 'success',
    howtouse: {}
  };
  param.howtouse['qrcode/hoge.png?text=boofoowoo'] = 'qrcode/hoge.png に boofoowoo のテキストを埋め込んだ qrコード を生成';
  param.howtouse['qrcode/remove/hoge.png'] = 'hoge.png 削除';
  param.howtouse['qrcode/remove/all'] = 'qrcode 内ファイル全削除';
  param.howtouse['qrcode/remove/123000'] = '123000 ミリ秒以上経過のファイル削除';

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/:path', async function (req, res, next) {

  if (req.query.text) {
    try {
      fs.statSync(base);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ファイル・ディレクトリは存在しないので作成します。');
        fs.mkdirSync(base);
      } else {
        console.log(error);
      }
    }
    var url = base + req.params.path;
    await qrCode.toFile(url, req.query.text);
    fs.readFile(url, function (err, data) {
      res.set('Content-Type', 'image/png');
      res.send(data);
    });
    return;
  }

  var param = {
    status: 'success',
    path: req.params.path
  };

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.get('/remove/:path', function (req, res, next) {

  var param = {
    status: 'success',
    command: 'remove',
    path: req.params.path
  };
  remove(req.params.path);

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

function remove(path) {
  try {
    fs.statSync(base);
  } catch (error) {
    if (error.code === 'ENOENT') {
      //console.log('ファイル・ディレクトリは存在しないので作成します。');
      //fs.mkdirSync(base);
    } else {
      console.log(error);
    }
    return;
  }
  if (path == 'all') {
    removeAll(base, 0);
  } else if (path.indexOf('.png') > 0) {
    fs.unlink(base + path, (err) => {
      if (err) throw err;
      console.log('削除しました。', base + path);
    });
  } else if (path.length > 0) {
    // path ミリ秒以上経過したファイルを削除する。
    var difference = parseInt(path);
    removeAll(base, difference);
  }
}

function removeAll(dir, difference) {
  if (difference == undefined) {
    return;
  }
  var date = new Date();
  const filenames = fs.readdirSync(dir);
  filenames.forEach((filename) => {
    const fullPath = path.join(dir, filename);
    const stats = fs.statSync(fullPath);
    if (stats.isFile()) {
      if (date.getTime() - stats.atime.getTime() >= difference) {
        fs.unlink(fullPath, (err) => {
          if (err) throw err;
          console.log('削除しました。', fullPath);
        });
      }
    } else if (stats.isDirectory()) {
      removeAll(fullPath);
    }
  });
}

module.exports = router;