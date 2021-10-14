$(function () {
  let roomID = 'test';
  //Enter the room exit popup
  $('#enter-name').on('keypress', function (e) {
    if (e.which == 13) {
      alert('You pressed enter!');
    }
  });

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
        generate_message('A new user connected', 'room-bot');
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

  /* <---------CHAT-BOX---------->  */
  /* <---------CHAT-BOX---------->  */
  /* <---------CHAT-BOX---------->  */

  var INDEX = 0;
  $('#chat-submit').click(function (e) {
    e.preventDefault();
    let msg = $('#chat-input').val();
    if (msg.trim() == '') {
      return false;
    }
    generate_message(msg, 'self');
    console.log('sending message');
    socket.emit('message-send', roomId, 10, msg);
  });
  function generate_message(msg, type) {
    // type = 'user' or 'self' of 'room-bot'
    INDEX++;
    let str = '';
    if (type != 'room-bot') {
      str += "<div id='cm-msg-" + INDEX + '\' class="chat-msg ' + type + '">';
      str += '          <span class="msg-avatar">';
      str += '            <img src="../content/user.png">';
      str += '          </span>';
      str += '          <div class="cm-msg-text">';
      str += msg;
      str += '          </div>';
      str += '        </div>';
    } else {
      str += "<div id='cm-msg-" + INDEX + '\' class="chat-msg ' + type + '">';
      str += msg;
      str += '</div>';
    }

    $('.chat-logs').append(str);
    $('#cm-msg-' + INDEX)
      .hide()
      .fadeIn(300);
    if (type == 'self') {
      $('#chat-input').val('');
    }
    $('.chat-logs')
      .stop()
      .animate({ scrollTop: $('.chat-logs')[0].scrollHeight }, 1000);
  }
  $(document).delegate('.chat-btn', 'click', function () {
    let name = $(this).html();
    $('#chat-input').attr('disabled', false);
    generate_message(name, 'self');
  });
  $('#chat-circle').click(function () {
    $('#chat-circle').toggle('scale');
    $('.chat-box').toggle('scale');
  });
  $('.chat-box-toggle').click(function () {
    $('#chat-circle').toggle('scale');
    $('.chat-box').toggle('scale');
  });
  /* <---------CHAT-BOX---------->  */
  /* <---------CHAT-BOX---------->  */
  /* <---------CHAT-BOX---------->  */

  /* <---------NAV-BAR---------> */
  /* <---------NAV-BAR---------> */
  /* <---------NAV-BAR---------> */
  $('.mic').click(() => {
    if ($('.mic').html() == 'mic') {
      $('.mic').text('mic_off');
      $('#mic').attr('id', 'mic_off');
    } else {
      $('.mic').text('mic');
      $('#mic').attr('id', 'mic');
    }
  });
  $('.cam').click(() => {
    if ($('.cam').html() == 'videocam') {
      $('.cam').text('videocam_off');
      $('#videocam').attr('id', 'videocam_off');
    } else {
      $('.cam').text('videocam');
      $('#videocam').attr('id', 'videocam');
    }
  });
  /* <---------NAV-BAR---------> */
  /* <---------NAV-BAR---------> */
  /* <---------NAV-BAR---------> */

  /* <---------UTILITY---------> */
  /* <---------UTILITY---------> */
  /* <---------UTILITY---------> */

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
  /* <---------UTILITY---------> */
  /* <---------UTILITY---------> */
  /* <---------UTILITY---------> */

  socket.on('deliver-message', (message, id) => {
    generate_message(message, 'user');
  });

  socket.on('user-disconnected', (message) => {
    generate_message(message, 'room-bot');
  });
});
