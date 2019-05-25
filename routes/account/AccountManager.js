exports.getInstance = function () {
  return new AccountManager();
};

var AccountManager = function () {
  this._list = {};
  this.maxAge = 60000;
  this._constructor();
}

AccountManager.prototype._constructor = function () {
  //console.log('AccountManager._constructor');
  try {
    var json = require('./accountdata.json');
    this._list = json.list || {};
    this.maxAge = json.maxAge || 60000;
  } catch (e) {

  }
};

AccountManager.prototype._save = function () {
  //console.log('AccountManager.save');
  var data = {};
  data['list'] = this._list;
  data['maxAge'] = this.maxAge;
  var fs = require("fs");
  var json = JSON.stringify(data, null, "    ");
  fs.writeFileSync("routes/account/accountdata.json", json);
  console.log("AccountManager.Save");
};

AccountManager.prototype.create = function (data) {
  //console.log('AccountManager.create');
  var result = {};
  var id = data.id;
  var pw = data.pw;
  if (id == undefined || pw == undefined) {
    result.status = "ng";
    result.messaga = "id/pw undefined";
  } else if (this._list[id] == undefined) {
    this._list[id] = {
      pw: pw,
      authority: 'user'
    };
    console.log('AccountManager.create 保存機能停止中');
    //this._save();// 追加分を保存できるようにするにはコメントアウト
    result.status = "success";
    result.messaga = "created";
  } else if (this._list[id]) {
    result.status = "ng";
    result.messaga = "hasid";
  }
  return result;
};

AccountManager.prototype.contain = function (account) {
  if (account == undefined) {
    return false;
  }
  if (typeof account == "string") {
    try {
      var obj = JSON.parse(account);
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }

  var id = obj.id;
  var pw = obj.pw;
  if (id == undefined || pw == undefined) {
    return false;
  } else if (this._list[id] == undefined) {
    return false;
  } else if (typeof this._list[id] != "object") {
    return false;
  } else if (this._list[id].pw == pw) {
    return true;
  } else {
    return false;
  }
};