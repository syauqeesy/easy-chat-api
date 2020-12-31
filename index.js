require('dotenv').config()
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', _ => {

})

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
