const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './images')
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname)
  }
})

const fileFilter = function (req, file, callback) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    return callback(null, true)
  }

  return req.res.status(400).json({
    status: 'Failed',
    statusCode: 400,
    message: 'Avatar must be an image!'
  })
}

module.exports = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1500000 } })
