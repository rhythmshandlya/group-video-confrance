const express = require('express');
const path = require('path');
const http = require('http');
const { ExpressPeerServer } = require('peer');
const { Server } = require('socket.io');

const app = express();

//SOCKET.io
const server = http.createServer(app);
const io = new Server(server);

// Running peerJs and Express on same server
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

//Set template engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/app/views')));

//Front End routes
app.get('/', (req, res) => {
  res.render('home', {});
});
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});
io.on('connection', async (socket) => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    socket.userId = userId;
    socket.userRoom = roomId;
    socket.userName = userName;
    socket.to(roomId).emit('new-user-connected', userId, userName);
  });
  socket.on('message-send', (roomId, userId, message, dp) => {
    socket.to(roomId).emit('deliver-message', message, userId, dp);
  });
  socket.on('dis', (roomId, id, name) => {
    socket.to(roomId).emit('user-disconnected', roomId, id, name);
  });
  socket.on('disconnect', function () {
    if (socket.userRoom && socket.userId && socket.userName)
      socket
        .to(socket.userRoom)
        .emit('user-disconnected', socket.userRoom, socket.userId, socket.userName);
  });
});

module.exports = server;
