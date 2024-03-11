const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { celebrate, Joi, errors } = require('celebrate');
const { login, createUser } = require('./controllers/user');
const { auth } = require('./middlewares/auth');
const NotFoundErr = require('./errors/NotFoundErr');
const { requestLogger, errorLogger } = require('./middlewares/logger');

require('dotenv').config();

const errorHandler = require('./middlewares/error');

mongoose.connect('mongodb://127.0.0.1/bitfilmsdb');

const { PORT = 3001 } = process.env;

const app = express();

app.use(cors({
  origin: '*',
}));

app.use(express.json());

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundErr('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
