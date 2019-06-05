fn();

async function fn() {
    var list = await getActiveAddressList();
    console.dir(list);

    try {
        var csv = require('./IPAddressList.csv');
        console.log(csv);
    } catch (e) {

    }

}


async function getActiveAddressList() {
    await getProcess('chcp 437');
    var msg = await getProcess('arp -a');
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

function getProcess(cmd) {
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