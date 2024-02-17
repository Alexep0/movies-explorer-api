const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestErr = require('../errors/BadRequestErr');
const NotFoundErr = require('../errors/NotFoundErr');
const {
  ValidationError,
  CastError,
} = require('mongoose').Error;

const User = require('../models/user');

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr(
          'Запрашиваемый пользователь не найден.',
        );
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestErr('Пользователь не существует'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    })
      .then((user) => {
        res.status(201).send(
          {
            name: user.name,
            _id: user._id,
          },
        );
      })
      .catch((err) => {
        if (err instanceof ValidationError) {
          next(new BadRequestErr('Данные введены некорректно'));
        } else if (err.code === 11000) {
          next(new ConflictErr('Пользователь с таким email уже зарегестрирован'));
        } else {
          next(err);
        }
      }));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV } = process.env;
      const { JWT_SECRET } = process.env;

      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
      res.status(200).send({ token });
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestErr('Данные введены некорректно'));
      } else {
        next(err);
      }
    });
};
