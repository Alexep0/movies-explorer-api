const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');
const UnauthorizedErr = require('../errors/UnauthorizedErr');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: { validator: (v) => isEmail(v) },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function checkUser(email, password) {
  return this.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      return Promise.reject(new UnauthorizedErr('Неправильные почта или пароль'));
    }

    return bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return Promise.reject(new UnauthorizedErr('Неправильные почта или пароль'));
      }

      return user;
    });
  });
};

module.exports = mongoose.model('user', userSchema);
