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

