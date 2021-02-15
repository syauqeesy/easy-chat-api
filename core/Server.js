const path = require('path')
const Controller = require(path.join(__dirname, '../core/Controller'))

class Server extends Controller {
  constructor () {
    super()

    this.app = this.modules.express()
    this.routes = require(path.join(__dirname, '../src/routes'))
  }

  listen () {
    this.app.listen(this.PORT, () => {
      console.log(`Server running on port ${this.PORT}`)
    })

    this.routes()
  }

  run (callback) {
    this.listen()
    callback()
  }
}

module.exports = Server
