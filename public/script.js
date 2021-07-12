const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const peer = new Peer(undefined,{
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream
const myVideo = document.createElement('video');
myVideo.muted = true; // setting my audio to true
const peers = {}
navigator.mediaDevices.getUserMedia({ //setting participants unmuted and video play initially
    video: true,
    audio: true
}).then(stream =>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream); // adding video to the server

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })

    socket.on('user-connected',(userId)=>{
        connecToNewUser(userId,stream);
    })  

    let text = $('input')

    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length != 0) {
            console.log(text.val())
            socket.emit('message', text.val()); /*sending the value of input*/
            text.val('')
        }
    })

    socket.on('createMessage', message =>{
        $('ul').append(`<li class="message"><b>user</b><br/>${message}</li`)
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })

peer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id);
})

function connecToNewUser(userId,stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
      })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () =>{  //scrollbottom funtion to scroll down the chat itself
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight")); //take argument to scrollHeight
}

 //Mute our video
const muteUnmute = () => { //mute and unmute function
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

//play or stop our video
  const playStop = () => {  // play ad stop sunction for video
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
