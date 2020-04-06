exports.getInstance = function (id) {
    return _idList[id];
};

exports.add = function (id) {
    if (_idList[id] == undefined) {
        _idList[id] = new WaitinglistManager(id);
    }
    return _idList[id];
};
var _idList = {};

var WaitinglistManager = function (id) {
    console.log('WaitinglistManager', id);
    this.data = {};
    this._constructor();
}

WaitinglistManager.prototype._constructor = function () {
    this._setDummy();
}

WaitinglistManager.prototype.getData = function () {
    return this.data;
}

WaitinglistManager.prototype.setData = function (data) {
    this.data = data;
    return 'success';
}

WaitinglistManager.prototype.setItem = function (id, item) {
    //console.log(id, item)
    var n = this.data.list.length;
    for (var i = 0; i < n; i++) {
        if (this.data.list[i].id == id) {
            this.data.list[i] = item;
            return this.data.list[i];
        }
    }
    return undefined;
}

WaitinglistManager.prototype.addItem = function (data) {
    var item = {};
    item.id = this.data.list.length;
    item.receptionNumber = this._maxReceptionNumber() + 1;
    item.name = '名無しさん';
    item.time = Date.now();
    item.status = 'wait';
    if (data.receptionNumber != undefined) {
        item.receptionNumber = data.receptionNumber;
    }
    if (data.name != undefined) {
        item.name = data.name;
    }
    this.data.list.push(item);
    return item;
}

WaitinglistManager.prototype._maxReceptionNumber = function () {
    var result = -1;
    var n = this.data.list.length;
    for (var i = 0; i < n; i++) {
        result = Math.max(result, parseInt(this.data.list[i].receptionNumber));
    }
    return result;
}

WaitinglistManager.prototype._setDummy = function () {
    var nameList = ['田中', '市原', '佐藤', '斎藤', '高橋', '小山', '小川', '山崎', '村川', '渡辺', '山田', '鈴木', '宮崎', '宮沢', '相川', '木村', '大川', '中川', '中沢', '沢田', '里中', '新田', '笠原', '上野'];
    var name2List = ['誠一', '茂樹', '博之', '遥', 'さとみ', '隆太', '洋介', '愛子', 'りえ', '理紗', '恭子', '菜々美', '樹里', '研二', '賢二', '努', 'ジョージ', 'ジローラモ', 'ひろみ', '光', '直人', '和之', '真帆', 'ヒロ', 'さゆり', '恵子', '千鶴子', '大五郎', 'だん吉', '直美', '美咲'];
    //var division = ['第一診察室', '第二診察室', '第三診察室', '第四診察室'];
    var list = [];
    var n = 15;
    for (var i = 0; i < n; i++) {
        var obj = {};
        obj.id = 100 + i;
        obj.receptionNumber = i + 1001;
        obj.name = nameList[Math.floor(Math.random() * nameList.length)];
        obj.name += ' ';
        obj.name += name2List[Math.floor(Math.random() * name2List.length)];
        obj.time = Date.now() - Math.floor((Math.random() * 1000 - n + i) * 1000);
        obj.status = Math.random() > 0.2 ? 'finished' : 'called';
        //obj.division = division[Math.floor(Math.random() * division.length)];
        list.push(obj);
    }
    var m = 15;
    for (var i = 0; i < m; i++) {
        var obj = {};
        obj.id = 100 + n + i;
        obj.receptionNumber = n + i + 1001;
        obj.name = nameList[Math.floor(Math.random() * nameList.length)];
        obj.name += ' ';
        obj.name += name2List[Math.floor(Math.random() * name2List.length)];
        obj.time = Date.now() - Math.floor(Math.random() * 1000 * 1000);
        obj.status = 'wait';
        //obj.division = division[Math.floor(Math.random() * division.length)];
        list.push(obj);
    }
    this.data.list = list;

}