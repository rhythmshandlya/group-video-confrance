const socket = io('/');

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: 3000
});

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);
  socket.emit('join-room', roomId, id);
});

socket.on('new-user-connected', (id) => {
  const newP = document.createElement('p');
  newP.innerHTML = 'A new user connected';
  newP.classList.add('center');
  document.getElementsByClassName('chat-data')[0].appendChild(newP);
});

socket.on('deliver-message', (message, id) => {
  const newP = document.createElement('p');
  newP.classList.add('right');
  newP.innerHTML = message;
  document.getElementsByClassName('write-message')[0].value = '';
  document.getElementsByClassName('chat-data')[0].appendChild(newP);
});

socket.on('user-disconnected', (message) => {
  const newP = document.createElement('p');
  newP.classList.add('center');
  newP.innerHTML = message;
  document.getElementsByClassName('chat-data')[0].appendChild(newP);
});

const sendBtn = document.getElementsByClassName('send-message');

sendBtn[0].addEventListener('click', () => {
  const message = document.getElementsByClassName('write-message')[0].value;
  if (message != '') {
    const newP = document.createElement('p');
    newP.classList.add('left');
    newP.innerHTML = message;
    document.getElementsByClassName('write-message')[0].value = '';
    document.getElementsByClassName('chat-data')[0].appendChild(newP);
    socket.emit('message-send', roomId, 10, message);
  }
});
