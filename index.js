require('dotenv').config()
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')
const axios = require('axios')

const { sequelize } = require('./models')
const user = require('./routes/user')
const chat = require('./routes/chat')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/images', express.static('./images'))

app.use('/api/users', user)
app.use('/api/chats', chat)

io.on('connection', socket => {
  socket.on('joinRoom', roomId => {
    console.log(`Join ${roomId}`)
    socket.join(roomId)
  })
  socket.on('sendMessage', message => {
    console.log('new message')
    axios.post(`${process.env.BASE_URL}/api/chats/save`, message, { headers: { authorization: message.token } })
      .then(() => {
        socket.to(message.chatUuid).emit('message', message)
      })
  })

  socket.on('changeChat', (roomId) => {
    console.log(`Leave ${roomId}`)
    socket.leave(roomId)
  })

  socket.on('disconnect', () => {
    console.log('User leave')
  })
})

server.listen(process.env.PORT, async () => {
  await sequelize.authenticate()
  console.log(`Server running on port ${process.env.PORT}`)
})
