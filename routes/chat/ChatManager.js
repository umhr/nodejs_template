exports.getInstance = function (name) {
    if (_nameList[name] == undefined) {
        _nameList[name] = new ChatManager(name);
    }
    return _nameList[name];
};
var _nameList = {};

var ChatManager = function (name) {
    this.name = name;
    this._list = [];
    this._listenerList = [];
    this._idlist = [];
    this._constructor();
}

ChatManager.prototype._constructor = function () {
    console.log('ChatManager._constructor', this.name);
    this._list = [{
        id: 'abcdefg123456',
        name: '木村 次郎',
        time: '07/31 13:31',
        message: '初めまして！'
    }, {
        id: 'abc123456',
        name: '山田 太郎',
        time: '07/31 13:27',
        message: 'こんにちは'
    }];
};

ChatManager.prototype.getList = function () {
    return this._list;
};

ChatManager.prototype.setList = function (data) {
    data.time = this._time();
    this._list.unshift(data);
    if (this._list.length > 10) {
        this._list.length = 10;
    }
    this.dispatchEvent('message', this._list);
    return this._list;
};

ChatManager.prototype.dispose = function (id) {
    this._idlist.splice(this._idlist.indexOf(id), 1);

    console.log('dispose', id, this._idlist);
    if (this._idlist.length == 0) {
        console.log('roomを削除します。', this.name);
        this._list = null;
        this._listenerList = null;
        this._idlist = null;
        _nameList[this.name] = null;
        delete _nameList[this.name];
        delete this;
    }
};

ChatManager.prototype.setid = function (id) {
    var n = this._idlist.length;
    for (var i = 0; i < n; i++) {
        if (this._idlist[i] == id) {
            return;
        }
    }
    this._idlist.push(id);
};

ChatManager.prototype._time = function () {
    var date = new Date();
    var result = '';
    result += (date.getMonth() + 101).toString().substr(1) + '/';
    result += (date.getDate() + 100).toString().substr(1) + ' ';
    result += (date.getHours() + 100).toString().substr(1) + ':';
    result += (date.getMinutes() + 100).toString().substr(1);
    return result;
};

ChatManager.prototype.addEventListener = function (type, listener) {
    this._listenerList.push({
        [type]: listener
    });
}

ChatManager.prototype.dispatchEvent = function (type, data) {
    this._listenerList.forEach(element => {
        element[type] == undefined || element[type](data);
    });
}

ChatManager.prototype.removeEventListener = function (type, listener) {
    var n = this._listenerList.length;
    for (var i = 0; i < n; i++) {
        if (this._listenerList[i][type] !== undefined && this._listenerList[i][type] == listener) {
            delete this._listenerList[i];
            this._listenerList.splice(i, 1);
            break;
        }
    }
}