require('dotenv').config()
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { User, Friend } = require('../models')
const verifyUser = require('../middlewares/verifyUser')
const upload = require('../middlewares/upload')
const fs = require('fs')

module.exports = router
  .post('/register', async (req, res) => {
    const { name, email, password } = req.body

    try {
      let user = await User.findOne({ where: { email } })
      if (user) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Email already used!'
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      user = await User.create({ name, email, password: hashedPassword, username: email.replace('@gmail.com', '') || email })

      return res.status(201).json({
        status: 'Success',
        message: 'Register success!',
        userUuid: user.uuid
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      const passwordMatched = await bcrypt.compare(password, user.password)
      if (!passwordMatched) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Password wrong!'
        })
      }

      const token = jwt.sign({ userUuid: user.uuid }, process.env.SECRET_KEY)

      return res.status(200).json({
        status: 'Success',
        message: 'Login success!',
        data: {
          userUuid: user.uuid,
          token
        }
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .get('/:uuid', verifyUser, async (req, res) => {
    const { uuid } = req.params
    try {
      const user = await User.findOne({ where: { uuid } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      return res.status(200).json({
        status: 'Success',
        message: 'User found!',
        user: { ...user.dataValues, avatar: `${process.env.BASE_URL}/images/${user.avatar}` }
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .patch('/:uuid', [verifyUser, upload], async (req, res) => {
    const { uuid } = req.params
    const { name, email, phonenumber, username, lat, lng, bio, status } = req.body
    try {
      const user = await User.findOne({ where: { uuid } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      if (req.file) {
        if (user.avatar !== 'user_default.jpg') {
          fs.unlink(`./images/${user.avatar}`, () => {
            //
          })
        }
        user.avatar = req.file.filename
      }

      user.name = name || user.name
      user.email = email || user.email
      user.phonenumber = phonenumber || user.phonenumber
      user.username = username || user.username
      user.lat = lat || user.lat
      user.lng = lng || user.lng
      user.bio = bio || user.bio
      user.status = status || user.status

      await user.save()

      return res.status(200).json({
        status: 'Success',
        message: 'User data updated!'
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
  .post('/add-friend/:username', verifyUser, async (req, res) => {
    const { username } = req.params
    try {
      const friend = await User.findOne({ where: { username } })
      if (!friend) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      const user = await User.findOne({ where: { uuid: req.user.userUuid } })
      if (!user) {
        return res.status(404).json({
          status: 'Failed',
          message: 'User not found!'
        })
      }

      const alreadyFriend = await Friend.findOne({
        where: {
          [Op.and]: [
            { userId: user.id },
            { friendUserId: friend.id }
          ]
        },
        include: [
          { model: User, as: 'friendData' },
          { model: User, as: 'userData' }
        ]
      })

      if (alreadyFriend) {
        return res.status(400).json({
          status: 'Failed',
          message: 'User with that username is already become your friend!'
        })
      }

      const newFriend = await Friend.create({ userId: user.id, friendUserId: friend.id })
      return res.status(201).json({
        status: 'Success',
        message: 'Added new friend!',
        friend: newFriend
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
