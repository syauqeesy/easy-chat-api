require('dotenv').config()
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const verifyUser = require('../middlewares/verifyUser')

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
        user
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 'Failed',
        message: 'Internal server error!'
      })
    }
  })
