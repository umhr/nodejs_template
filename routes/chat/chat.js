var express = require('express');
var chatManager = require('./ChatManager').getInstance();
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
      socket.data = data;
      console.log('login', data);
      socket.emit('setup', {
        id: socket.id.substr(socket.id.indexOf('#') + 1),
        list: chatManager.getList()
      });
    });

    socket.on('set', (data) => {
      data.id = socket.id.substr(socket.id.indexOf('#') + 1);
      chatManager.setList(data);

      socket.emit('receive', {
        id: socket.id.substr(socket.id.indexOf('#') + 1),
        list: chatManager.getList()
      });
    });

    chatManager.addEventListener('message', onList);

    socket.on('disconnect', () => {
      console.log('disconnect');
    });

    function onList(c) {
      if (socket.data == undefined) {
        //console.dir(socket);
        return;
      }
      socket.emit('receive', {
        id: socket.id.substr(socket.id.indexOf('#') + 1),
        list: chatManager.getList()
      });
    }
  });
}



module.exports = router;