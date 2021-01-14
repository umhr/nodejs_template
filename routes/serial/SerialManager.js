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
    this._setSerialPort();
}

/**
 * ports 例
  {
    path: 'COM5',
    manufacturer: 'Arduino LLC (www.arduino.cc)',
    serialNumber: '7493730393635160A0C0',
    pnpId: 'USB\\VID_2341&PID_0043\\7493730393635160A0C0',
    locationId: 'Port_#0002.Hub_#0006',
    vendorId: '2341',
    productId: '0043'
  }
 */
SerialManager.prototype._setSerialPort = function () {
    var SerialPort = require("serialport");
    var setting = require('../../system/Setting.js').getInstance();
    var serialSetting = setting.get('serial');
    if(serialSetting == undefined){
        return;
    }
    var keys = Object.keys(serialSetting);
    if(keys.length == 0){
        return;
    }
    // console.log(keys[0], serialSetting[keys[0]]);

    // path に COM3 などで指定がある場合、そこを見に行く
    if(serialSetting.path && serialSetting.path.toUpperCase().indexOf('COM') == 0){
        this._setPort(serialSetting.path.toUpperCase());
        return;
    }
    var key = keys[0];
    var value = serialSetting[key];
    // path に指定が無く、他の要素に指定がある場合
    SerialPort.list().then(
        (ports) => {
            console.dir(ports);
            var isSet = false;
            ports.forEach((portInfo, index)=>{
                if(portInfo[key] && portInfo[key].indexOf(value) == 0){
                    this._setPort(portInfo.path);
                    isSet = true;
                }
            })
            if(!isSet){
                this._retry();
            }
        },
        (err) => {console.error(err)}
    )
}

SerialManager.prototype._setPort = function (path) {
    console.log('SerialManager._setPort ', path);
    var SerialPort = require("serialport");
    this.port = new SerialPort(path,{ baudRate: 9600 });
    // ポートあけた
    this.port.on('open', ()=> {
        console.log('serialPort open ');
        //console.dir(this.port._readableState.reading);
    });
    this.port.on('error', (err)=> {
        console.log('Error:', err.message);
        if(err.message.indexOf('File not found') > -1){
            this._retry();
        }
    });

    this.port.on('close', (err)=> {
        console.log('close:', err);
        if(err.disconnected){
            this._retry();
        }
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
    this.port.on('data', (data)=> {
        var str = String(data);
        console.log(str);
        // 受信文字列に 0 が含まれていると
        if(str.indexOf('0') > -1 || str.indexOf('1') > -1 || str.indexOf('2') > -1 || str.indexOf('3') > -1){
            str = str.replace(/\r|\n/g,'');
            //console.log('Received from the serial port.', text);
            this.dispatchEvent('received', str);
        }
    });
}

SerialManager.prototype._retry = function () {
    console.log('SerialManager._retry');
    //console.dir(this.port);
    setTimeout(()=>{
        this._setSerialPort()
    }, 10*1000);
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