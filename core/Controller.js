const path = require('path')
const Config = require(path.join(__dirname, '../core/Config'))

class Controller extends Config {
  constructor () {
    super()

    this.modules = {
      express: require('express'),
      Sequelize: require('sequelize')
    }
  }
}

module.exports = Controller
