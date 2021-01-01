'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate ({ Friend, ChatUser }) {
      // define association here
      this.hasMany(Friend, { foreignKey: 'friendUserId', as: 'friends' })
      this.hasMany(Friend, { foreignKey: 'userId', as: 'users' })
      this.hasMany(ChatUser, { foreignKey: 'userId', as: 'chats' })
    }
  };
  User.init({
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'User must have a name' },
        notEmpty: { msg: 'Name is required' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'User must have an email' },
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Must be a valid email' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'User must have an password' },
        notEmpty: { msg: 'Password is required' }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user_default.jpg'
    },
    phonenumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '081234567890'
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    lng: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Hi there, I\'m using EasyChat!'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'offline'
    }
  }, {
    sequelize,
    modelName: 'User'
  })
  return User
}
