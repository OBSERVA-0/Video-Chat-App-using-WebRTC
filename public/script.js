// Connect to the server using Socket.IO
const socket = io('/')

// Get the video grid container element
const videoGrid = document.getElementById('video-grid')

// Create a new PeerJS connection
const myPeer = new Peer(undefined, {
  host: '/', // Use default host
  port: '3001' // PeerJS server port
})

// Create a video element for the user's own video
const myVideo = document.createElement('video')
myVideo.muted = true // Mute own video to avoid feedback

// Object to keep track of peers
const peers = {}

// Request access to the user's media devices (camera and microphone)
navigator.mediaDevices.getUserMedia({
  video: true, // Enable video
  audio: true // Enable audio
}).then(stream => {
  // Add the user's video stream to the grid
  addVideoStream(myVideo, stream)

  // Listen for incoming calls
  myPeer.on('call', call => {
    call.answer(stream) // Answer the call with the user's stream
    const video = document.createElement('video') // Create a video element for the incoming stream
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) // Add the incoming user's video to the grid
    })
  })

  // When a new user connects, establish a connection with them
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

// Handle when a user disconnects
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close() // Close the peer connection
})

// Emit the join-room event when the PeerJS connection is open
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id) // Notify the server of the user's room and ID
})

// Connect to a new user who just joined the room
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream) // Call the new user with the current user's stream
  const video = document.createElement('video') // Create a video element for the new user's stream
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream) // Add the new user's video to the grid
  })
  call.on('close', () => {
    video.remove() // Remove the video element when the call ends
  })

  peers[userId] = call // Save the call object in the peers map
}

// Add a video stream to the video grid
function addVideoStream(video, stream) {
  video.srcObject = stream // Set the video source to the media stream
  video.addEventListener('loadedmetadata', () => {
    video.play() // Play the video once metadata is loaded
  })
  videoGrid.append(video) // Add the video element to the grid
}
