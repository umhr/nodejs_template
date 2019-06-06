exports.getInstance = function () {
    //console.log('DBManager');
    return new AccessManager();
};

var AccessManager = function () {
    this._list = [];
    this._sqLiteManager;
    this._constructor();
}

AccessManager.prototype._constructor = function () {
    //console.log('AccessManager.prototype._constructor');
    this._sqLiteManager = new SQLiteManager();
};

AccessManager.prototype.set = function (query, ipAddress) {
    var data = {};
    data.name = query.name == undefined ? '' : query.name;
    data.language = query.language == undefined ? '' : query.language;
    data.ipAddress = ipAddress;
    this._list.push(data);
    //console.log(data);
    this._sqLiteManager.set(data);
};

AccessManager.prototype.get = async function (query, data) {
    if (query.format == 'csv' || query.format == 'raw') {
        data.format = query.format;
    } else {
        data.format = 'json';
    }
    data.endDate = this._dateFormat(query.endDate, 0);
    if (query.startDate == undefined) {
        data.startDate = this._dateFormat(query.endDate, -30);
    } else {
        data.startDate = this._dateFormat(query.startDate, -30);
    }
    return await this._sqLiteManager.get(data);
};

AccessManager.prototype._dateFormat = function (str, add) {
    var date = new Date();
    date.setDate(date.getDate() + add);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    if (str != undefined) {
        var list = str.split('-');
        if (list.length == 3) {
            if (!isNaN(parseInt(list[0]))) {
                y = parseInt(list[0]);
            }
            if (!isNaN(parseInt(list[1]))) {
                m = parseInt(list[1]);
            }
            if (!isNaN(parseInt(list[2]))) {
                d = parseInt(list[2]);
            }
        }
    }
    var mm = (m + 100).toString().substr(1);
    var dd = (d + 100).toString().substr(1);
    return y + '-' + mm + '-' + dd;
};

var SQLiteManager = function () {
    this._db;
    this._constructor();
}

SQLiteManager.prototype._constructor = function () {
    console.log('SQLiteManager.prototype._constructor');
    var sqlite = require('sqlite3').verbose();
    this._db = new sqlite.Database(__dirname + '/access.sqlite');
    this._db.run("CREATE TABLE IF NOT EXISTS access(_id  integer primary key autoincrement not null, name TEXT, language TEXT, ipaddress TEXT, datetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')))");
};

SQLiteManager.prototype.set = function (data) {
    return new Promise((resolve, reject) => {
        this._db.serialize(() => {
            var stmt = this._db.prepare('INSERT INTO access(name, language, ipaddress) VALUES(?,?,?)');
            stmt.run([data.name, data.language, data.ipAddress]);
            stmt.finalize();
            resolve();
        });
    });
};

SQLiteManager.prototype.get = function (data) {
    //console.dir(data);
    return new Promise((resolve, reject) => {
        this._db.serialize(() => {
            var isCount = data.format != 'raw';
            var sqlstr = "";
            if (isCount) {
                sqlstr += "SELECT name, language, count(*)";
            } else {
                sqlstr += "SELECT _id, name, language, ipaddress, datetime";
            }
            sqlstr += " FROM access";
            sqlstr += " WHERE '" + data.startDate + " 00:00:00' <= datetime AND datetime <= '" + data.endDate + " 23:59:59'";
            if (isCount) {
                sqlstr += " GROUP BY name, language ORDER BY name ASC";
            } else {
                sqlstr += " ORDER BY ROWID ASC";
            }
            var list = [];
            this._db.each(sqlstr, (err, row) => {
                    list.push(row);
                },
                (err, count) => {
                    resolve(list);
                });
        });
    });
};

SQLiteManager.prototype.close = function () {
    this._db.close();
};