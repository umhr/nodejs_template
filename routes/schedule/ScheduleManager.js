exports.getInstance = function () {
    //console.log('DBManager');
    return new ScheduleManager();
};

var ScheduleManager = function () {
    this._fs = require("fs");
    this._data = {};
    this._listenerList = [];
    this._constructor();
}

ScheduleManager.prototype._constructor = function () {
    console.log('ScheduleManager._constructor');
    try {
        var json = require('./scheduledata.json');
        this._setJson(json);
    } catch (e) {
        this._data = {
            everyday:{}
        };
        var sec = 15*60*60+26*60+15;
        this._data.everyday[sec] = {enable:true, event:'shell', command:'adb -s 192.168.1.12:5555 reboot'};
        sec = 12*60*60+30*60+0;
        this._data.everyday[sec] = {enable:true, event:'shell', command:'adb -s 192.168.1.12:5555 shell input keyevent KEYCODE_HOME'};    
    }
    this._start();
}

ScheduleManager.prototype._setJson = function (json) {
    this._data = json.data;
}

ScheduleManager.prototype.set = function (data) {
    this._data = data;
    this.save();
}

ScheduleManager.prototype.get = function () {
    return this._data;
}

ScheduleManager.prototype._run = function (date) {
    var time = Math.floor(date.getTime()/1000);
    time -= date.getTimezoneOffset()*60;
    //var keys = Object.keys(this._data.everyday);
    var everydayTime = time%(24*60*60);
    if(this._data.everyday[everydayTime]){
        console.log('ScheduleManager._run');
        var obj = this._data.everyday[everydayTime];
        console.dir(obj);
        if(obj.event){
            this.dispatchEvent(obj.event, obj);
        }
    }
    //console.log(time, keys[0], everydayTime);
}

ScheduleManager.prototype._start = function () {
    var seconds = -1;
    var count = 8;
    setInterval(()=>{
        count ++;
        if(count < 8){
            return;
        }
        var date = new Date();
        if(date.getSeconds() == seconds){
            return;
        }
        seconds = date.getSeconds();
        count = 0;
        this._run(date);
    },100);
};

ScheduleManager.prototype.save = function () {
    var path = 'routes/schedule/scheduledata.json';
    var data = {};
    data.data = this._data;
    var json = JSON.stringify(data, null, "");
    this._fs.writeFileSync(path, json);
    console.log("ScheduleManager Saved!");
};

ScheduleManager.prototype.addEventListener = function (type, listener) {
    this._listenerList.push({
        [type]: listener
    });
}

ScheduleManager.prototype.dispatchEvent = function (type, data) {
    this._listenerList.forEach(element => {
        element[type] == undefined || element[type](data);
    });
    //console.dir(this._listenerList);
}

ScheduleManager.prototype.removeEventListener = function (type, listener) {
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