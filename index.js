require('dotenv').config()
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const { sequelize } = require('./models')
const user = require('./routes/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/users', user)

io.on('connection', _ => {

})

server.listen(process.env.PORT, async () => {
  await sequelize.authenticate()
  console.log(`Server running on port ${process.env.PORT}`)
})
