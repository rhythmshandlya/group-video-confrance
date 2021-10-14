const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: 3000
});

//When peer connection is established
peer.on('open', (MyId) => {
  console.log('My id ', MyId);
  socket.emit('join-room', roomId, MyId);
});

const connectToNewUser = (new_user_id, stream) => {
  const call = peer.call(new_user_id, stream);
  const video = document.createElement('video');
  console.log(call.on);
  call.on('stream', (usersStream) => {
    connectVideoStreamAndAppend(video, usersStream);
  });
  call.on('close', () => {
    video.remove();
  });
};

const connectVideoStreamAndAppend = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then((stream) => {
    connectVideoStreamAndAppend(myVideo, stream);

    socket.on('new-user-connected', async (new_user_id) => {
      console.log('New user connected ', new_user_id);

      //Connect Video
      setTimeout(connectToNewUser, 5000, new_user_id, stream);

      //Display message in chat
      const newP = document.createElement('p');
      newP.innerHTML = 'A new user connected';
      newP.classList.add('center');
      document.getElementsByClassName('chat-data')[0].appendChild(newP);
    });

    peer.on('call', (call) => {
      const newVideo = document.createElement('video');
      call.answer(stream);
      call.on('stream', (usersStream) => {
        connectVideoStreamAndAppend(newVideo, usersStream);
      });
    });
  })
  .catch((err) => {
    alert(err);
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
