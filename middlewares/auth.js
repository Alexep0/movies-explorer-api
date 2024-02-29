/* eslint-disable prefer-destructuring */
const jwt = require('jsonwebtoken');

const UnauthorizedErr = require('../errors/UnauthorizedErr');

module.exports.auth = (req, res, next) => {
  let token = req.header('Authorization');

  if (!token) {
    token = req?.cookies?.jwt;
  } else if (token.split(' ')[0] === 'Bearer') {
    token = token.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedErr('Отказ в доступе'));
  }

  let payload;
  try {
    const secret = process.env.JWT_SECRET || 'some-secret-key';

    payload = jwt.verify(token, secret);
  } catch (err) {
    return next(new UnauthorizedErr('Отказ в доступе'));
  }
  req.user = payload;
  return next();
};
