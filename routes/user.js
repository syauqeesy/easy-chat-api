const router = require('express').Router()
const bcrypt = require('bcrypt')
const { User } = require('../models')

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
      return res.status(400).json(error)
    }
  })
