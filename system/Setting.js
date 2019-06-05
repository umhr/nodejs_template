exports.getInstance = function () {
  if (instance == undefined) {
    instance = new Setting();
  }
  return instance;
};

const settingjson = require('./Setting.json');
var instance;
var Setting = function () {
  this.count = 0;
  this._constructor();
}

Setting.prototype._constructor = function () {
  //console.log('Setting._constructor');
  //console.dir(settingjson);
}

Setting.prototype.getCount = function () {
  this.count++;
  return this.count;
}

Setting.prototype.get = function (prop) {
  return settingjson[prop];
}