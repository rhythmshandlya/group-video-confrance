let myName = '';
let myPeerId;
let myStream;
const users = new Map();
dps = [
  'https://i.ibb.co/Tm751rh/dp1.png',
  'https://i.ibb.co/LkR2658/dp2.jpg',
  'https://i.ibb.co/1RydjVB/dp3.jpg',
  'https://i.ibb.co/r28m6vR/dp5.jpg',
  'https://i.ibb.co/Np7MBJS/dp4.jpg',
  'https://i.ibb.co/K9z75B7/download.jpg',
  'https://i.ibb.co/Vqm55ST/images.jpg',
  'https://i.ibb.co/n0qVwRR/shrek4-disneyscreencaps-com-675-0.jpg',
  'https://i.ibb.co/ZKFgV3h/images-1.jpg',
  'https://i.ibb.co/MpfWdq7/images-2.jpg',
  'https://i.ibb.co/wzh5ndY/evil-kermit-meme.jpg',
  'https://i.ibb.co/44dMw6T/images-3.jpg'
];
const dp = dps[~~(dps.length * Math.random())];

$(function () {
  //Enter the room exit popup
  $('#enter-name').on('keypress', function (e) {
    if (e.which == 13) {
      myName = $('#enter-name').val();
      if (myName != '') {
        $('.popup').addClass('hidden');
        createRoom();
      }
    }
  });
  function createRoom() {
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
    peer.on('open', (myId) => {
      myPeerId = myId;
      myVideo.setAttribute('id', myId);
      users.set(myId, myName);
      users.set(myName, myId);
      addItemToList(myName);
      socket.emit('join-room', roomId, myId, myName);
    });
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: {
          autoGainControl: false,
          channelCount: 2,
          echoCancellation: false,
          latency: 0,
          noiseSuppression: false,
          sampleRate: 48000,
          sampleSize: 16,
          volume: 1.0
        }
      })
      .then((stream) => {
        myStream = stream;
        muteUnmuteCam();
        muteUnmuteMic();
        connectVideoStreamAndAppend(myVideo, stream);
        socket.on('new-user-connected', async (new_user_id, user_name) => {
          //Connect Video
          setTimeout(connectToNewUser, 3000, new_user_id, user_name, stream);
          //Display message in chat
          generate_message(`${user_name} just connected`, 'room-bot');
        });
        peer.on('call', (call) => {
          const newVideo = document.createElement('video');
          newVideo.setAttribute('id', call.metadata.callerId);
          users.set(call.metadata.callerId, call.metadata.callerName);
          addItemToList(call.metadata.callerName);
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

    var INDEX = 0;
    $('#chat-submit').click(function (e) {
      e.preventDefault();
      let msg = $('#chat-input').val();
      if (msg.trim() == '') {
        return false;
      }
      generate_message('You: ' + msg, 'self', dp);
      console.log('sending message');
      socket.emit('message-send', roomId, 10, myName + ': ' + msg, dp);
    });
    function generate_message(msg, type, user_dp) {
      // type = 'user' or 'self' of 'room-bot'
      INDEX++;
      let str = '';
      if (type != 'room-bot') {
        str += "<div id='cm-msg-" + INDEX + '\' class="chat-msg ' + type + '">';
        str += '          <span class="msg-avatar">';
        str += `            <img src=${user_dp}>`;
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
      if (type != 'self') {
        $('#open-chat-btn').addClass('shake');
      }
      setTimeout(() => {
        $('#open-chat-btn').removeClass('shake');
      }, 500);
    }
    $(document).delegate('.chat-btn', 'click', function () {
      let name = $(this).html();
      $('#chat-input').attr('disabled', false);
      generate_message(name, 'self');
    });
    $('#chat-circle').click(function () {
      $('#open-chat-btn').css('color', 'white');
      $('#chat-circle').toggle('scale');
      $('.chat-box').toggle('scale');
    });
    $('.chat-box-toggle').click(function () {
      $('#chat-circle').toggle('scale');
      $('.chat-box').toggle('scale');
    });
    /* <---------CHAT-BOX---------->  */

    /* <---------NAV-BAR---------> */
    $('.exit').click(() => {
      socket.emit('dis', roomId, myPeerId, myName);
      window.location.replace('http://localhost:3000');
    });

    $('.mic').click(() => {
      if ($('.mic').html() == 'mic') {
        $('.mic').text('mic_off');
        $('#mic').attr('id', 'mic_off');
      } else {
        $('.mic').text('mic');
        $('#mic').attr('id', 'mic');
      }
      muteUnmuteMic();
    });
    $('.cam').click(() => {
      if ($('.cam').html() == 'videocam') {
        $('.cam').text('videocam_off');
        $('#videocam').attr('id', 'videocam_off');
      } else {
        $('.cam').text('videocam');
        $('#videocam').attr('id', 'videocam');
      }
      muteUnmuteCam();
    });
    $('.content_copy').click(function (e) {
      e.preventDefault();
      const elem = document.createElement('textarea');
      elem.value = roomId;
      document.body.appendChild(elem);
      elem.select();
      document.execCommand('copy');
      document.body.removeChild(elem);
    });
    $('.side-nav-btn').click(function () {
      $('.side-nav').toggleClass('width-zero');
    });
    /* <---------NAV-BAR---------> */

    /* <---------UTILITY---------> */

    const connectToNewUser = (new_user_id, user_name, stream) => {
      options = { metadata: { callerId: myPeerId, callerName: myName } };
      const call = peer.call(new_user_id, stream, options);
      const video = document.createElement('video');
      video.setAttribute('id', new_user_id);
      users.set(new_user_id, user_name);
      addItemToList(user_name);
      call.on('stream', (usersStream) => {
        connectVideoStreamAndAppend(video, usersStream);
      });
      call.on('close', () => {
        console.log('removing..');
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
    function muteUnmuteMic() {
      myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    }
    function muteUnmuteCam() {
      myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    }
    function addItemToList(name) {
      $('.members').append(`<li>${name}</li>`);
    }

    /* <---------UTILITY---------> */
    socket.on('deliver-message', (message, id, dp) => {
      generate_message(message, 'user', dp);
    });
    socket.on('user-disconnected', (roomId, id, name) => {
      document.getElementById(id).remove();
      users.delete(id);
      const listItems = $('.members li');
      listItems.each(function (idx, li) {
        let product = $(li);
        console.log(product.text());
        if (product.text() == name) {
          $('.members li').eq(idx).remove();
          return;
        }
      });
      generate_message(name + ' disconnected!', 'room-bot');
    });
  }
});
