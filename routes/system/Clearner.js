exports.getInstance = function () {
    if(instance == undefined){
        instance = new Clearner();
    }
    return instance;
};

var instance;
var Clearner = function () {
    this._listenerList = [];
    this.fs = require('fs');
    this._constructor();
}

Clearner.prototype._constructor = function () {
    console.log('Clearner._constructor');
}

Clearner.prototype.do = function (str, path) {
    //console.log('Clearner.do',str.length);
    //console.log(str.length);
    var aList = this.listFromString(str);
    var bList = this.listFromDir(path + 'upload');
    var result = [];
    //console.log('Clearner.do',aList.length,bList.length);
    bList.forEach((bItem)=>{
        if(aList.indexOf(bItem) == -1){
            var url = path + bItem;
            console.log('Clearner.do', bItem);
            this.fs.unlink(url,(err)=>{});
            result.push(url);
        }
    });
    return result;
};

Clearner.prototype.listFromString = function (str) {
    //console.log('Clearner.listFromString');
    var dir = "upload/";
    var list = str.split('"' + dir).slice(1).map((value,index)=>{
        var result = value.substr(0, value.indexOf('"'));
        return dir + result;
    });
    return Array.from(new Set(list));
};

Clearner.prototype.listFromDir = function (pathStr) {
    //console.log('Clearner.listFromDir');
    //https://kuroeveryday.blogspot.com/2018/03/recursive-directory-search-with-nodejs.html
    //const path = require('path');
    //const fs = require('fs');
    // ファイルタイプの列挙体（のつもり）
    const FileType = {
        File: 'file',
        Directory: 'directory',
        Unknown: 'unknown'
    }
    /**
     * ファイルの種類を取得する
     * @param {string} path パス
     * @return {FileType} ファイルの種類
     */
    const getFileType = path => {
        //console.log('getFileType', path2);
        try {
            const stat = this.fs.statSync(path);
            switch (true) {
            case stat.isFile():
                return FileType.File;

            case stat.isDirectory():
                return FileType.Directory;

            default:
                return FileType.Unknown;
            }

        } catch(e) {
            return FileType.Unknown;
        }
    }

    /**
     * 指定したディレクトリ配下のすべてのファイルをリストアップする
     * @param {string} dirPath 検索するディレクトリのパス
     * @return {Array<string>} ファイルのパスのリスト
     */
    const listFiles = dirPath => {
        //console.log('listFiles', dirPath);
        const result = [];
        const paths = this.fs.readdirSync(dirPath);
        paths.forEach(a => {
            //console.log(a);
            const path = `${dirPath}/${a}`;
            switch (getFileType(path)) {
            case FileType.File:
                result.push(path);
                break;
            case FileType.Directory:
                result.push(...listFiles(path));
                break;
            default:
                /* noop */
            }
        })
        return result;
    };

    //const dirPath = path.resolve(__dirname, pathStr);
    var index = pathStr.lastIndexOf('/')+1;
    return listFiles(pathStr).map((path)=>{
        //console.log(index, path.length, path);
        return path.substr(index);
    });
};
