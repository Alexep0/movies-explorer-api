const {
  ValidationError,
  DocumentNotFoundError,
  CastError,
} = require('mongoose').Error;
const BadRequestErr = require('../errors/BadRequestErr');
const NotFoundErr = require('../errors/NotFoundErr');
const ForbiddenErr = require('../errors/ForbiddenErr');

const Movie = require('../models/movie');

module.exports.getMovieByOwner = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((cards) => res.send(cards))
    .catch((err) => {
      if (err instanceof DocumentNotFoundError) {
        next(new NotFoundErr('Запрашиваемый пользователь не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestErr('Данные введены некорректно'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  Movie.findOne({ cardId: movieId })
    .then((card) => {
      if (!card) {
        throw new NotFoundErr('Карточка не найдена');
      }
      console.log(card);
      if (card.owner.toString() === req.user._id) {
        card.deleteOne()
          .then(() => {
            res.status(200).send({ data: card });
          })
          .catch((err) => {
            next(err);
          });
      } else {
        next(new ForbiddenErr('Недостаточно прав'));
      }
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestErr('Данные введены некорhректно'));
      } else {
        next(err);
      }
    });
};
