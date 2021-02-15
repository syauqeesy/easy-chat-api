const path = require('path')
const Controller = require(path.join(__dirname, '../../core/Controller'))

const controller = new Controller

module.exports = () => {
  const app = controller.modules.express()
  app.get('/', (_, res) => {
    res.send({ message: 'mantapppzz' })
  })
}
