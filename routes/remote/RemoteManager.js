var fs = require('fs');
exports.getInstance = function () {
  return new RemoteManager();
};

var RemoteManager = function () {
  this._constructor();
}

RemoteManager.prototype._constructor = async function () {
  await this._getProcess('chcp 65001');
  //"public/remote/temp/"生成
  var dir  = "public/remote/temp/";
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    fs.mkdirSync(dir);
  }else{
    //this.cleanup();
  }
}

RemoteManager.prototype.cleanup = async function () {
  var dir  = "public/remote/temp/";
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    fs.readdir(dir, function(err, files){
      if(err){
        throw err;
      }
      files.forEach(function(file){
        fs.unlink(`${dir}/${file}`, function(err){
          if(err){
            throw(err);
          }
          console.log(`deleted ${file}`);
        });
      })
    })
  }
}

RemoteManager.prototype.list = function () {
  return new Promise((resolve, reject) => {
    var dir  = "public/remote/temp/";
    fs.readdir(dir, function(err, files){
      var result = [];
      if(err){
        throw err;
      }
      files.forEach(function(file){
        result.push("temp/" + file);
      })
      resolve(result);
    })
  });
}

RemoteManager.prototype.process = async function (filename, param) {
  //console.log(filename.lastIndexOf('.ps1'), filename.length - 4);
  var cmd = (filename.lastIndexOf('.ps1') == filename.length - 4)?'powershell ':'';
  cmd += __dirname + "\\" + filename;
  if(param){
    cmd += ' ' + param.split(',').join(' ');
  }
  var result = await this._getProcess(cmd);
  return result;
}

RemoteManager.prototype._getProcess = function (cmd) {
  return new Promise((resolve, reject) => {
      require('child_process').exec(cmd, (err, stdout, stderr) => {
          var result = {};
          if(err){
            result['err'] = err;
          }
          if(stdout){
            result['stdout'] = stdout;
            result['stdoutlist'] = [];
            stdout.split('\r\n').forEach((val)=>{
              if(val != ''){
                result['stdoutlist'].push(val);
              }
            })
            //result['stdoutlist'] = stdout.split('\r\n');
          }
          if(stderr){
            result['stderr'] = stderr;
          }
          console.dir(result);
          resolve(result);
      });
  });
}

RemoteManager.prototype.exit = function () {

}