const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

server.listen(3000);

let numPlayers = 0;
let emptyRooms = [true, true, true, true];

app.use(serve('public'));

io.on('connection', socket => {
  let chosenRoom = -1;

  socket.emit('status', emptyRooms);

  socket.on('join', room => {
    if (!emptyRooms[room]) return;
    chosenRoom = room;
    emptyRooms[room] = false;
    io.emit('join', room);
    console.log(`Player joins Room ${room}`);
  });

  socket.on('joined', room =>{
    chosenRoom = -1;
  });

  socket.on('event', data => {
    if (data.startsWith('over')) {
      room = parseInt(data.slice(4));
      emptyRooms[room] = true;
      io.emit('leave', room);
    } else {
      socket.broadcast.emit('event', data);
    }
  });

  socket.on('disconnect', () => {
    if (chosenRoom == -1) return;
    io.emit('leave', chosenRoom);
    emptyRooms[chosenRoom] = true;
    console.log(`Player leaves Room ${chosenRoom}`);
  });
});
