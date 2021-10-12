$(function () {
  var INDEX = 0;
  $('#chat-submit').click(function (e) {
    e.preventDefault();
    let msg = $('#chat-input').val();
    if (msg.trim() == '') {
      return false;
    }
    generate_message(msg, 'self');
  });

  function generate_message(msg, type) {
    INDEX++;
    let str = '';
    str += "<div id='cm-msg-" + INDEX + '\' class="chat-msg ' + type + '">';
    str += '          <span class="msg-avatar">';
    str += '            <img src="../content/user.png">';
    str += '          </span>';
    str += '          <div class="cm-msg-text">';
    str += msg;
    str += '          </div>';
    str += '        </div>';
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

  $('.mic').click(() => {
    if ($('.mic').html() == 'mic') {
      $('.mic').text('mic_off');
      $('#mic').attr('id', 'mic_off');
    } else {
      $('.mic').text('mic');
      $('#mic').attr('id', 'mic');
    }
  });
});
