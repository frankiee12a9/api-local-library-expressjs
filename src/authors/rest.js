import { Authors } from './document.js';
import { Books } from '../books/document.js';
import { badRequest, notFound } from '../middlewares/exceptions.js';
import { createAuthor, updateAuthor } from '../core/param-validation.js';
import { validate } from '../core/validate.js';
import ApiError from '../shared/api-error.js';

import httpStatus from 'http-status';
import express from 'express';

const router = express.Router();

router.param('id', async (req, res, next, id) => {
  await Authors.findById(id)
    .then((_author) => {
      if (_author) {
        req.author = _author;
        next(); // next to PUT or DELETE, those use this helper
        return null;
      }
      const err = new ApiError('자료 없음', httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:id', (req, res) => {
  const { author } = req;
  return res.status(httpStatus.OK).json(author);
});

router.get('/', async (req, res, next) => {
  let result;
  await Authors.smartQuery(req.query)
    .then((authors) => {
      result = authors;
      return Authors.smartCount(req.query);
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

router.post('/', validate(createAuthor), async (req, res, next) => {
  let authorToCreate = new Authors(req.body);

  await Authors.findOne({ author_code: authorToCreate.author_code })
    .then((_author) => {
      if (!_author) {
        return authorToCreate.save();
      }
      const err = new ApiError('EXISTING_AUTHOR', httpStatus.BAD_REQUEST, true);
      return Promise.reject(err);
    })
    .then((_author) => {
      res.status(httpStatus.CREATED).json(_author);
      return null;
    })
    .catch((e) => {
      console.error('ERROR', e);
      return next(e);
    });
});

router.put('/:id', validate(updateAuthor), (req, res, next) => {
  const { author } = req;
  Object.assign(author, req.body).save((err, response) => {
    if (err) {
      next(err);
    }
    res.status(201).json(response);
  });
});

router.delete('/:id', notFound, async (req, res, next) => {
  const { author } = req;
  await author
    .remove()
    .then((response) => res.status(httpStatus.OK).json(response))
    .catch((err) => {
      next(err);
    });
});

export default router;
