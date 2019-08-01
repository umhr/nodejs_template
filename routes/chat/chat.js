var express = require('express');
var chatManagerFactory = require('./ChatManager');
var router = express.Router();

router.get('/', function (req, res, next) {
  console.log(req.url);
  var param = {
    command: req.query.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

router.setIO = (io) => {
  const app = io.of('/chat');

  app.on('connection', (socket) => {
    //console.log('connection');

    socket.on('login', (data) => {
      if (data.roomid == undefined) {
        data.roomid = 'undefined';
      }
      var id = socket.id.substr(socket.id.indexOf('#') + 1);
      data.id = id;
      socket.data = data;
      console.log(socket.data.roomid);
      var chatManager = chatManagerFactory.getInstance(data.roomid);
      chatManager.addEventListener('message', onList);
      chatManager.setid(id);
      console.log('login', data);
      socket.emit('setup', {
        id: id,
        list: chatManager.getList(),
        roomid: socket.data.roomid
      });
    });

    socket.on('set', (data) => {
      var chatManager = chatManagerFactory.getInstance(socket.data.roomid);
      data.id = socket.data.id;
      chatManager.setList(data);

      socket.emit('receive', {
        id: socket.data.id,
        list: chatManager.getList()
      });
    });

    //chatManager.addEventListener('message', onList);

    socket.on('disconnect', () => {
      if (socket.data == undefined) {
        return;
      }
      var chatManager = chatManagerFactory.getInstance(socket.data.roomid);
      chatManager.dispose(socket.data.id);
      console.log('disconnect');
    });

    function onList(c) {
      if (socket.data == undefined) {
        //console.dir(socket);
        return;
      }
      var chatManager = chatManagerFactory.getInstance(socket.data.roomid);
      socket.emit('receive', {
        id: socket.data.id,
        list: chatManager.getList()
      });
    }
  });
}



module.exports = router;