exports.getInstance = function (name) {
  if (_nameList[name] == undefined) {
    _nameList[name] = new ViewerManager(name);
  }
  return _nameList[name];
};

exports.getList = function () {
  var list = [];
  for (var p in _nameList) {
    list.push(p);
  }
  return list;
};
var _nameList = {};
var fs = require('fs');

var ViewerManager = function (name) {
  this.name = name;
  this.currentList = [];
  this.currentHash = '';
  this._constructor();
}

ViewerManager.prototype._constructor = function () {
  console.log('_constructor!!!', this.name);
};

ViewerManager.prototype.getList = function () {
  console.log('getList', this.name);
  var self = this;
  var files = fs.readdirSync('./public/viewer/' + this.name + '/assets');
  var tempList = files.filter(function (file) {
    if (file.toLocaleLowerCase().lastIndexOf('.jpg') == file.length - '.jpg'.length) {
      if (file.toLocaleLowerCase().lastIndexOf('.mp4.jpg') == file.length - '.mp4.jpg'.length) {
        return !self._isContain(files, file.substr(0, file.lastIndexOf('.jpg')));
      }
      return true;
    } else if (file.toLocaleLowerCase().lastIndexOf('.mp4') == file.length - '.mp4'.length) {
      return true;
    } else {
      return false;
    }
  });
  var hash = this._getHash(tempList);
  if (this.currentHash != hash) {
    this.currentHash = hash;
    var list = [];
    var n = tempList.length;
    for (var i = 0; i < n; i++) {
      var url = tempList[i];
      list[i] = {
        url: url,
        duration: this._getDuration(url)
      }
    }
    this.currentList = list;
  }

  return this.currentList;
};

ViewerManager.prototype.setList = function (list) {
  var result = [];
  var n = list.length;
  for (var i = 0; i < n; i++) {
    result.push(list[i].url);
  }
  n = this.currentList.length;
  for (var i = 0; i < n; i++) {
    var url = this.currentList[i].url;
    if (!this._isContain(result, url)) {
      fs.unlink('./public/viewer/' + this.name + '/assets/' + url, function (err) {
        if (err) throw err;
        //console.log('deleted', currentList[i].url);
      });
      if (url.toLocaleLowerCase().lastIndexOf('.mp4') == url.length - '.mp4'.length) {
        fs.unlink('./public/viewer/' + this.name + '/assets/' + url + '.jpg', function (err) {
          if (err) throw err;
          //console.log('deleted', currentList[i].url);
        });
      }
    }
  }

  this.currentList = list;
  this.currentHash = this._getHash(result);

  return result;
};

ViewerManager.prototype._getHash = function (list) {
  list.sort();
  var hash = '';
  var n = list.length;
  for (var i = 0; i < n; i++) {
    hash += list[i];
  }
  return hash;
};

ViewerManager.prototype._getDuration = function (url) {
  var n = this.currentList.length;
  for (var i = 0; i < n; i++) {
    if (this.currentList[i].url == url) {
      return this.currentList[i].duration;
    }
  }
  return 10;
};

ViewerManager.prototype._isContain = function (list, str) {
  var n = list.length;
  for (var i = 0; i < n; i++) {
    if (list[i] == str) {
      return true;
    }
  }
  return false;
};