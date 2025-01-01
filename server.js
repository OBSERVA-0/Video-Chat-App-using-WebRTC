const express = require('express') // Import the Express library
const app = express() // Create an Express application
const server = require('http').Server(app) // Create an HTTP server
const io = require('socket.io')(server) // Attach Socket.IO to the server
const { v4: uuidV4 } = require('uuid') // Import the uuid library for generating unique IDs

// Set EJS as the view engine for rendering templates
app.set('view engine', 'ejs')

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Redirect users from the root URL to a new unique room
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`) // Generate a unique room ID and redirect
})

// Render the room view for a specific room ID
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room }) // Pass the room ID to the template
})

// Handle Socket.IO connections
io.on('connection', socket => {
  // When a user joins a room, broadcast their connection to others in the room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId) // Join the room with the specified room ID
    socket.to(roomId).broadcast.emit('user-connected', userId) // Notify others in the room

    // Handle user disconnection and notify others in the room
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId) // Notify others of disconnection
    })
  })
})

// Start the server on port 3000
server.listen(3000, (err) => {
    if (err) {
        console.error("Error starting server:", err) // Log any errors
    } else {
        console.log("Server running at http://localhost:3000") // Confirm the server is running
    }
});
