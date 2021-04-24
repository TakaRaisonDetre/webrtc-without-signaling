const express = require('express')

var io = require('socket.io')
({
    path: '/webrtc'
})


const app = express()
const port = 8080

//app.get('/', (req, res)=> res.send('Hello RTC'))
// to use a middleware to serve all static files from build folder
app.use(express.static(__dirname +'/build'))
app.get('/', (req,res)=>{
    res.sendFile(__dirname + 'build/index.html')
})

const server = app.listen(port, ()=> console.log('Example 1'))

io.listen(server)
const peers= io.of('/webrtcPeer')

// keep a referenxe of all socket connections

let connectedPeers = new Map()

peers.on('connection', socket=>{
    console.log(socket.id)
    socket.emit('connection-success', {success:socket.id})
    connectedPeers.set(socket.id, socket)

    socket.on('disconnect',()=>{
        console.log('disconnected')
        connectedPeers.delete(socket.id)
    })

     socket.on('offerOrAnswer',(data)=>{
         //send to the other peer(s) if any
         for (const [socketID, socket] of connectedPeers.entries()){
             // not self
             if(socketID!==data.socketID){
                 console.log(socketID, data.payload.type)
                 // payload is sdp
                 socket.emit('offerOrAnswer', data.payload) // we need to create event handler for client side app
             }
         }
     })

     socket.on('candidate', (data)=>{
         // send candidate to the other peer if any
         for(const [socketID, socket] of connectedPeers.entries()){
              // not self
              if(socketID!==data.socketID){
                  console.log(socketID, data.payload)
                  // candidate info
                  socket.emit('candidate', data.payload) // we need to create event handler for client side app
              }
         }
     })
})