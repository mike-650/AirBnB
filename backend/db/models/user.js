'use strict';
const bcrypt = require('bcryptjs/dist/bcrypt');
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafeObject() {
      const { id, username, email, firstName, lastName } = this;
      return { id, username, email, firstName, lastName };
    }
    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString())
    }
    static getCurrentUserById(id) {
      return User.scope("currentUser").findByPk(id);
    }
    static async login({ credential, password}) {
      const { Op } = require('sequelize');
      const user = await User.scope('loginUser').findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
      if (user && user.validatePassword(password)) {
        return await User.scope('currentUser').findByPk(user.id)
      }
    }
    static async signup({ username, email, password, firstName, lastName }) {
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({
        username,
        email,
        hashedPassword,
        firstName,
        lastName
      });

      return await User.scope('currentUser').findByPk(user.id);
    }
    static associate(models) {
      User.hasMany(models.Spot, {foreignKey: 'ownerId'});
      User.hasMany(models.Booking, {foreignKey: 'userId'});
      User.hasMany(models.Review, {foreignKey: 'userId'});
      User.belongsToMany(models.Spot, {through: models.Booking, foreignKey: 'userId', otherKey: 'spotId'});
      User.belongsToMany(models.Spot, {through: models.Review, foreignKey: 'userId', otherKey: 'spotId'});
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error("Cannot be an email.")
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'createdAt', 'updatedAt'],
        }
      },
      scopes: {
        currentUser: {
          attributes: {
            exclude: ['hashedPassword', 'createdAt', 'updatedAt']
          }
        },
        loginUser: {
          attributes: {}
        }
      }
    }
  );
  return User;
};
