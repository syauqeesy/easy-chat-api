const path = require('path')
const { development: config } = require(path.join(__dirname, 'DatabaseConfig'))
const Controller = require(path.join(__dirname, 'Controller'))

class Model extends Controller {
  initialize () {
    const Sequelize = new this.modules.Sequelize(config.database, config.username, config.password, config)
    return Sequelize
  }
}

const model = new Model()
const sequelize = model.initialize()

module.exports = {
  sequelize,
  Model
}
