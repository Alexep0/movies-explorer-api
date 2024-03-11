const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { linkValidate } = require('../utils/constants');

const {
  getMovieByOwner,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

router.get('/', getMovieByOwner);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().regex(linkValidate).required(),
    trailerLink: Joi.string().regex(linkValidate).required(),
    thumbnail: Joi.string().regex(linkValidate).required(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}), deleteMovie);

module.exports = router;
