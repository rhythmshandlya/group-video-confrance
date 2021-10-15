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
app.use(express.static(path.join(__dirname, 'Views')));

//Front End routes
app.get('/', (req, res) => {
  res.render('home', {});
});
app.get('/:room', (req, res) => {
  res.render('test', { roomId: req.params.room });
});
io.on('connection', async (socket) => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.to(roomId).emit('new-user-connected', userId, userName);
  });
  socket.on('message-send', (roomId, userId, message) => {
    console.log(roomId, userId);
    socket.to(roomId).emit('deliver-message', message, userId);
  });
  socket.on('disconnecting', () => {
    socket.to(socket.roomId).emit('user-disconnected', 'A user disconnected');
  });
});

module.exports = server;
