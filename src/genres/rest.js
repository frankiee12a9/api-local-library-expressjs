import { Genres } from './document.js';
import { validate } from '../core/validate.js';
import { createGenre } from '../core/param-validation.js';
import { uploadFileHelper } from '../shared/file-upload-util.js';
import upload from '../shared/multer.js';
import ApiError from '../shared/api-error.js';

import httpStatus from 'http-status';
import express from 'express';

const router = express.Router();

router.param('id', async (req, res, next, id) => {
  await Genres.findById(id)
    .then((_genre) => {
      if (_genre) {
        req.genre = _genre;
        next();
        return null;
      }
      const err = new ApiError('자료 없음', httpStatus.NOT_FOUND, true);
      res.status(httpStatus.NOT_FOUND).json(err);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  const { genre } = req;
  res.status(200).json(genre);
});

router.get('/', async (req, res, next) => {
  let result;
  await Genres.smartQuery(req.query)
    .then((genres) => {
      result = genres;
      return Genres.smartCount(req.query);
    })
    .then((count) => {
      res.set('X-TOTAL-COUNT', parseInt(count, 10));
      res.status(httpStatus.OK).json(result);
      return null;
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.put('/:id', (req, res, next) => {});

router.post(
  '/',
  upload.single('image'),
  validate(createGenre),
  async (req, res, next) => {
    let genreToCreate = new Genres(req.body);

    Genres.findOne({ name: genreToCreate.name })
      .then(async (_genre) => {
        if (_genre) {
          const err = new ApiError(
            'EXISTING_GENRE',
            httpStatus.BAD_REQUEST,
            true
          );
          next(err);
        }

        if (req.file) {
          uploadFileHelper(req.file).then((response) => {
            Genres.findOneAndUpdate(
              { name: genreToCreate.name },
              { image: response },
              { new: true }
            ).catch((err) => {
              console.error(err);
              next(err);
            });
          });
        }

        return genreToCreate.save();
      })
      .then(async (_genre) => {
        res.status(httpStatus.CREATED).json(_genre);
        return null;
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  }
);

router.delete('/:id', async (req, res, next) => {
  const { genre } = req;
  await genre
    .remove()
    .then((response) => res.status(httpStatus.OK).json(response))
    .catch((err) => {
      next(err);
    });
});

export default router;
