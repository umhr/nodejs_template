exports.getInstance = function () {
    //console.log('DBManager');
    return new AliveManager();
};

var AliveManager = function () {
    this._list = [];
    this._constructor();
}

AliveManager.prototype._constructor = async function () {
    var nameAddressList = await this._getIPAddressList();
    var activeAddressList = await this._getARP();
    activeAddressList = await this._setADBstatus(activeAddressList);
    //console.dir(list);
    var list = [];
    var n = nameAddressList.length;
    for (var i = 0; i < n; i++) {
        var IPAddress = nameAddressList[i].IPAddress;
        var m = activeAddressList.length;
        nameAddressList[i]['status'] = 'ng';
        for (var j = 0; j < m; j++) {
            if (IPAddress == activeAddressList[j].IPAddress) {
                nameAddressList[i]['status'] = 'ok';
                nameAddressList[i]['MACAddress'] = activeAddressList[j].MACAddress;
                nameAddressList[i]['type'] = activeAddressList[j].type;
                if (activeAddressList[j].adb) {
                    nameAddressList[i]['adb'] = activeAddressList[j].adb;
                }
                if (activeAddressList[j].productModel) {
                    nameAddressList[i]['productModel'] = activeAddressList[j].productModel;
                }
                break;
            }
        }
    }

    var n = activeAddressList.length;
    for (var i = 0; i < n; i++) {
        if (this._hasIPAddress(nameAddressList, activeAddressList[i].IPAddress) == undefined) {
            activeAddressList[i]['status'] = 'ng';
            nameAddressList.push(activeAddressList[i]);
        }
    }
    this._list = nameAddressList;
    console.dir(nameAddressList);

}

AliveManager.prototype.getActive = async function () {
    return this._list;
};



AliveManager.prototype._hasIPAddress = function (list, IPAddress) {
    var n = list.length;
    for (var i = 0; i < n; i++) {
        if (list[i].IPAddress == IPAddress) {
            return list[i];
        }
    }
    return undefined;
}

AliveManager.prototype._setADBstatus = async function (list) {
    var adb = 'C:\\Users\\hiroshi\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';
    var n = list.length;
    for (var i = 2; i < n; i++) {
        var cmd = adb + ' connect ' + list[i].IPAddress + ':5555';
        var msg = await this._getProcess(cmd);
        if (msg.stdout.indexOf('connected to') != -1) {
            list[i]['adb'] = 'active';
            var msg = await this._getProcess(adb + ' -s ' + list[i].IPAddress + ' shell getprop ro.product.model');
            list[i]['productModel'] = msg.stdout.substr(0, msg.stdout.length - 2);
        }
    }
    return list;
};

AliveManager.prototype._getIPAddressList = async function () {
    const fs = require('fs');
    const parse = require('csv').parse;

    return new Promise((resolve, reject) => {
        const parser = parse((err, data) => {
            var list = [];
            var n = data.length;
            for (var i = 1; i < n; i++) {
                if (data[i].length >= 1) {
                    var obj = {};
                    obj['name'] = data[i][0];
                    obj['IPAddress'] = data[i][1];
                    list.push(obj);
                }
            }
            resolve(list);
        });
        fs.createReadStream(__dirname + '/IPAddressList.csv').pipe(parser);
    });
}


AliveManager.prototype._getARP = async function () {
    await this._getProcess('chcp 65001');
    var msg = await this._getProcess('arp -a');
    var list = msg.stdout.split('\r\n');
    var addList = [];
    var n = list.length;
    for (var i = 3; i < n; i++) {
        // 複数のスペース
        var li = list[i].replace(/\x20+/g, ',').split(',');
        if (li.length > 4) {
            var obj = {};
            obj['status'] = 'ok';
            obj['IPAddress'] = li[1];
            obj['MACAddress'] = li[2];
            obj['type'] = li[3];
            addList.push(obj);
        }
    }
    return addList;
}

AliveManager.prototype._getProcess = function (cmd) {
    return new Promise((resolve, reject) => {
        require('child_process').exec(cmd, (err, stdout, stderr) => {
            var result = {};
            result['err'] = err;
            result['stdout'] = stdout;
            result['stderr'] = stderr;
            resolve(result);
        });
    });
}