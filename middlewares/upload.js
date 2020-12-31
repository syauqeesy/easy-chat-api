const fileHandler = require('../helpers/fileHandler').single('avatar')
const multer = require('multer')
const upload = (req, res, next) => {
  fileHandler(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: error.message
      })
    }

    if (error) {
      return res.status(500).json({
        status: 'Failed',
        statusCode: 500,
        message: error
      })
    }

    next()
  })
}

module.exports = upload
