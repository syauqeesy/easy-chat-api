require('dotenv').config()
const router = require('express').Router()
const { Op } = require('sequelize')
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
        where: {
          [Op.and]: [
            { userId: user.id },
            { toUserId: toUser.id }
          ]
        }
      })

      if (chatUser) {
        return res.status(400).json({
          status: 'Failed',
          message: 'You already have personal chat with that user!'
        })
      }

      const chat = await Chat.create()

      await ChatUser.create({ chatId: chat.id, userId: user.id, toUserId: toUser.id })

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

      chats = await User.findOne({
        include: [
          {
            model: ChatUser,
            as: 'chats',
            where: {
              [Op.or]: [
                { userId: user.id },
                { toUserId: user.id }
              ]
            }
          }
        ]
      })
      
      const userChats = []
      for (const chat of chats.chats) {
        let toUser = {}
        if (chat.userId === user.id) {
          toUser = await User.findOne({ where: { id: chat.toUserId } })
        } else {
          toUser = await User.findOne({ where: { id: chat.userId } })
        }

        userChats.push({
          id: chat.id,
          user: toUser
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
