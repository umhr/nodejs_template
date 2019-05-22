var express = require('express');
var dataManager = require('./api/DataManager').getInstance();
var router = express.Router();

dataManager.addEventListener('count', watchCount);

/* api?command=set&count=456 */
router.get('/', function (req, res, next) {
  console.log(req.url);
  var count;
  if (req.query.command == 'set') {
    count = dataManager.setCount(parseInt(req.query.count));
  } else if (req.query.command == 'up') {
    count = dataManager.up();
  } else if (req.query.command == 'down') {
    count = dataManager.down();
  } else {
    count = dataManager.getCount();
  }
  var param = {
    count: count,
    command: req.query.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

/* api/params/up */
router.get('/params/:command', function (req, res, next) {
  console.log(req.url);
  var count;
  if (req.params.command == 'up') {
    count = dataManager.up();
  } else if (req.params.command == 'down') {
    count = dataManager.down();
  } else {
    count = dataManager.getCount();
  }
  var param = {
    count: count,
    command: req.params.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

/* api/params/set/456 */
router.get('/params/:command/:count', function (req, res, next) {
  console.log(req.url);
  var count;
  if (req.params.command == 'set') {
    count = dataManager.setCount(parseInt(req.params.count));
  } else {
    count = dataManager.getCount();
  }
  var param = {
    count: count,
    command: req.params.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(param);
});

/* POST users listing. */
router.post('/', function (req, res, next) {
  console.log(req.url);
  var count;
  if (req.body.command == 'set') {
    count = dataManager.setCount(parseInt(req.body.count));
  } else if (req.body.command == 'up') {
    count = dataManager.up();
  } else if (req.body.command == 'down') {
    count = dataManager.down();
  } else {
    count = dataManager.getCount();
  }
  var param = {
    count: count,
    command: req.body.command
  };
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin: *');
  res.send(param);
});

router.setIO = (io) => {
  console.log('app.io');
  const app = io.of('/api');

  app.on('connection', (socket) => {
    console.log('connection');

    socket.on('login', (data) => {
      socket.data = data;
      console.log('login', data);
      socket.emit('setup', {
        count: dataManager.getCount()
      });
    });

    socket.on('up', () => {
      console.log('up', socket.data);
      dataManager.up();
    });

    socket.on('down', () => {
      console.log('down', socket.data);
      dataManager.down();
    });

    socket.on('set', (data) => {
      console.log('set', socket.data);
      dataManager.setCount(data.count);
    });

    dataManager.addEventListener('count', onCount);

    socket.on('disconnect', () => {
      console.log('disconnect', socket.data);
      dataManager.removeEventListener('count', onCount);
    });

    function onCount(c) {
      if (socket.data == undefined) {
        //console.dir(socket);
        return;
      }
      socket.emit('receive', {
        id: socket.data.id,
        count: c
      });
    }
  });
}

function watchCount(c) {
  console.log('count:', c);
}

process.on("exit", function () {
  dataManager.exit();
});
process.on("SIGINT", function () {
  process.exit(0);
});

module.exports = router;