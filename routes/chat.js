require('dotenv').config()
const router = require('express').Router()
const { User, Chat, ChatUser, ChatMessage } = require('../models')
const verifyUser = require('../middlewares/verifyUser')

module.exports = router
  .post('/create', verifyUser, async (req, res) => {
    const { userUuid, toUserUuid } = req.body
    try {
      const user = await User.findOne({ where: { uuid: userUuid } })
      const toUser = await User.findOne({ where: { uuid: toUserUuid } })

      if (!user || !toUser) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      const chatUser = await ChatUser.findOne({
        where: { userId: user.id }
      })

      const chatToUser = await ChatUser.findOne({
        where: { userId: toUser.id }
      })

      if (chatUser && chatToUser && chatUser.chatId === chatToUser.chatId) {
        return res.status(400).json({
          status: 'Failed',
          message: 'You already have personal chat with that user!'
        })
      }

      const chat = await Chat.create()

      await ChatUser.create({ chatId: chat.id, userId: user.id })
      await ChatUser.create({ chatId: chat.id, userId: toUser.id })

      await ChatMessage.create({ chatId: chat.id, senderId: user.id, body: 'Hello this is first message!' })

      return res.status(200).json({
        status: 'Success',
        message: 'Create chat success!'
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .post('/save', verifyUser, async (req, res) => {
    const { chatUuid, senderUuid, body } = req.body
    try {
      const chat = await Chat.findOne({ where: { uuid: chatUuid } })
      const user = await User.findOne({ where: { uuid: senderUuid } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      if (!chat) {
        return res.status(404).json({
          status: 'Failed',
          message: 'Chat not found!'
        })
      }
      const message = await ChatMessage.create({ chatId: chat.id, senderId: user.id, body })
      return res.status(201).json({
        status: 'Success',
        message: 'Message saved',
        chatMessage: message
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .get('/', verifyUser, async (req, res) => {
    try {
      const user = await User.findOne({ where: { uuid: req.user.userUuid } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

    const chats = await User.findOne({
      include: [
        {
          model: ChatUser,
          as: 'chats',
          where: { userId: user.id }
        }
      ]
    })

    const userChats = []
    for (const chat of chats.chats) {
      let toUser = {}
      const toChat = await ChatUser.findAll({ where: { chatId: chat.chatId } })
      const toChatId = toChat.find(chat => {
        return chat.userId !== user.id
      })
      toUser = await User.findOne({ where: { id: toChatId.userId } })
      const messages = await ChatMessage.findAll({ where: { chatId: toChatId.chatId }, order: [['createdAt', 'DESC']] })
      const chatUuid = await Chat.findOne({ where: { id: chat.chatId } })

      userChats.push({
        id: chat.id,
        uuid: chatUuid.uuid,
        userId: user.id,
        toUserId: chat.toUserId === user.id ? chat.userId : chat.toUserId,
        user: {
          name: toUser.name,
          avatar: `${process.env.BASE_URL}/images/${toUser.avatar}`
        },
        lastMessage: messages[0]
      })
    }

    return res.status(200).json({
      user: user.id,
      status: 'Success',
      message: 'Get chats success!',
      chats: userChats
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'Failed',
      message: 'Internal server error!'
    })
  }
})
.get('/messages/:uuid', verifyUser, async (req, res) => {
  const { uuid } = req.params
  try {
    const chat = await Chat.findOne({ where: { uuid: uuid } })
    const messages = await ChatMessage.findAll({ where: { chatId: chat.id }, order: [['createdAt', 'DESC']] })

    return res.status(200).json({
      status: 'Success',
      message: 'Get messages success!',
      messages
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'Failed',
      message: 'Internal server error!'
    })
  }
})
