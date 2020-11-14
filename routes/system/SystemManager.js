var clearner = require("./Clearner").getInstance();

exports.getInstance = function () {
    console.log('SystemManager');
    return new SystemManager();
};

var SystemManager = function () {
    this._fs = require("fs");
    this._data = {};
    this._constructor();
}

SystemManager.prototype._constructor = function () {
    console.log('SystemManager._constructor');
    try {
        var json = require('../../routes/system/system.json');
        this._setJson(json);
    } catch (e) {
        //console.dir(e);
        this._data['item0'] = {text:'あいうえおかきくけこ', img0src:'assets/256x256.jpg', img1src:'assets/256x256.jpg', img2src:'assets/256x256.jpg'};
        this._data['item1'] = {text:'hijklmn'};
        this._data['item2'] = {text:'opqrstu'};
    }
};

SystemManager.prototype._setJson = function (json) {
    console.log('SystemManager._setJson');
    this._data = json.data;
}

SystemManager.prototype.save = function () {
    var path = 'routes/system/system.json';
    var data = {};
    data.data = this._data;
    var json = JSON.stringify(data, null, "");
    this._fs.writeFileSync(path, json);
    console.log("SystemManager Saved!");
};

SystemManager.prototype.getData = function () {
    return this._data;
};

SystemManager.prototype.setData = function (data) {
    console.dir(data);
    this._data = data;
};

SystemManager.prototype.cleanup = function () {
    var str = JSON.stringify(this.getData());
    return clearner.do(str, 'public/system/');
};

SystemManager.prototype.exit = function () {
    console.log('SystemManager.exit');
    this.save();
};