exports.getInstance = function () {
    console.log('NetinfoManager');
    return new NetinfoManager();
};

var NetinfoManager = function () {
    this._list = [];
    this.progress = 0;
    this.lastupdate = '';
    this._constructor();
}

NetinfoManager.prototype._constructor = function () {
    //this.refresh();
}

NetinfoManager.prototype.refresh = async function () {
    if (0 < this.progress && this.progress < 1) {
        return;
    }
    this.progress = 0.001;
    var activeAddressList = await this._getARP();
    this._list = activeAddressList;
    this.progress = 1;
    this.lastupdate = new Date().toString();
    console.dir(activeAddressList);
};

NetinfoManager.prototype.getActive = function () {
    if (this.lastupdate == '' && this.progress == 0) {
        this.refresh();
    }
    return this._list;
};

NetinfoManager.prototype._getARP = async function () {
    await this._getProcess('chcp 65001');
    var localAddress = await this._getLocalAddress();
    //console.log(localAddress);
    //console.dir(await this._getProcess('arp -d'));
    var namelist = await this._setPing(localAddress);
    //this._getProcess('arp -d');
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
            if (namelist[li[1]] != undefined) {
                obj['name'] = namelist[li[1]];
            }
            addList.push(obj);
        }
    }
    return addList;
}

NetinfoManager.prototype._getLocalAddress = async function () {
    var msg = await this._getProcess('ipconfig');
    var list = msg.stdout.split('\r\n');
    var n = list.length;
    for (var i = 0; i < n; i++) {
        if (list[i].indexOf('IPv4') > -1) {
            return list[i].substr(list[i].indexOf(':') + 2);
        }
    }
    return '192.168.1.2';
}

NetinfoManager.prototype._setPing = async function (localAddress) {
    var address = localAddress.substr(0, localAddress.lastIndexOf('.') + 1);
    //console.log(address);
    var result = {};
    var n = 256;
    for (var i = 1; i < n; i++) {
        var ping = await this._getProcess('ping -n 1 -w 3 ' + address + i);
        console.log(address + i);
        if (ping['err'] == null) {
            var nbstat = await this._getProcess('nbtstat -a ' + address + i);
            if (nbstat.stdout.indexOf('Name Table') > -1) {
                var list = nbstat.stdout.split('\r\n');
                var m = list.length;
                for (var j = 0; j < m; j++) {
                    if (list[j].indexOf('<20>') > -1) {
                        console.log(list[j]);
                        var name = list[j].substr(0, list[j].indexOf('<20>'));
                        name = name.replace(/\s/g, '');
                        result[address + i] = name;
                    }
                }

            }
        }
        this.progress = i / n;
    }
    return result;
}

NetinfoManager.prototype._getProcess = function (cmd) {
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