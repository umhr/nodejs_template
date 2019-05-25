exports.getInstance = function () {
    //console.log('DBManager');
    return new DBManager();
};

var DBManager = function () {
    this._count = 0;
    this._listenerList = [];
    this._constructor();
}

DBManager.prototype._constructor = function () {
    //console.log('DBManager._constructor');
    try {
        var json = require('./savedata.json');
        this._count = json.count || 0;
    } catch (e) {

    }
    //console.log(json, this._count);
};

DBManager.prototype.getCount = function () {
    return this._count;
};

DBManager.prototype.up = function () {
    this._count++;
    this.dispatchEvent('count', this._count);
    return this._count;
};

DBManager.prototype.down = function () {
    this._count--;
    this.dispatchEvent('count', this._count);
    return this._count;
};

DBManager.prototype.setCount = function (count) {
    if (count === undefined) {
        return this._count;
    }
    this._count = count;
    this.dispatchEvent('count', this._count);
    return this._count;
};

DBManager.prototype.exit = function () {
    var data = {};
    data['count'] = this._count;
    var fs = require("fs");
    var json = JSON.stringify(data, null, "");
    fs.writeFileSync("routes/api/savedata.json", json);
    console.log("DBManager Saved!");
};

DBManager.prototype.addEventListener = function (type, listener) {
    this._listenerList.push({
        [type]: listener
    });
}

DBManager.prototype.dispatchEvent = function (type, data) {
    this._listenerList.forEach(element => {
        element[type] == undefined || element[type](data);
    });
    //console.dir(this._listenerList);
}

DBManager.prototype.removeEventListener = function (type, listener) {
    var n = this._listenerList.length;
    for (var i = 0; i < n; i++) {
        if (this._listenerList[i][type] !== undefined && this._listenerList[i][type] == listener) {
            delete this._listenerList[i];
            this._listenerList.splice(i, 1);
            break;
        }
    }
    //console.dir(this._listenerList);
}