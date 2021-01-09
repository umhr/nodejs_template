'use strict';
exports.getInstance = function () {
    return new SerialManager();
};

var SerialManager = function () {
    this._listenerList = [];
    this._constructor();
}

SerialManager.prototype._constructor = function () {
    console.log('SerialManager._constructor');
    var SerialPort = require("serialport");
    var setting = require('../../system/Setting.js').getInstance();
    var serialPort = setting.get('serialPort');
    // Node.jsでシリアル通信(Windows環境)
    // https://fuwafuwac.com/?p=531
    this.port = new SerialPort(serialPort,{ baudRate: 9600 });
    // ポートあけた
    this.port.on('open', function() {
        console.log('serialPort open');
    });

    // 送信テスト
    this.port.write("I am SerialManager.", function(err){
        if(err){
            // エラーハンドル
            return console.log('error:', err.message);
        }
        // 成功
        console.log("send");
    });

    // 受信待ち
    this.port.on('data', function(data) {
        var text = String(data);
        //console.log(text);
        // 受信文字列に r が含まれていると
        if(text.indexOf('r') > -1){
            console.log('Received from the serial port.');
        }
    });
};

SerialManager.prototype.addEventListener = function (type, listener) {
    this._listenerList.push({
        [type]: listener
    });
}

SerialManager.prototype.dispatchEvent = function (type, data) {
    this._listenerList.forEach(element => {
        element[type] == undefined || element[type](data);
    });
}

SerialManager.prototype.removeEventListener = function (type, listener) {
    var n = this._listenerList.length;
    for (var i = 0; i < n; i++) {
        if (this._listenerList[i][type] !== undefined && this._listenerList[i][type] == listener) {
            delete this._listenerList[i];
            this._listenerList.splice(i, 1);
            break;
        }
    }
}