const createRoomBtn = document.getElementById('create-new-room');
const joinRoomBtn = document.getElementById('join-room');

createRoomBtn.addEventListener('click', () => (window.location.href = `/${uuidv4()}`));
joinRoomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const id = document.getElementById('join-room-input').value;
  window.location.href = `/${document.getElementById('join-room-input').value}`;
});
