import { Images } from './document.js';

import httpStatus from 'http-status';
import express from 'express';

const router = express.Router();

router.get('id', async (req, res, next, id) => {
  await Images.findById(id)
    .then((_image) => {
      if (_book) {
        req.image = _image;
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

router.get('/:id', (req, res, next) => {
  const { image } = req;
  return res.status(httpStatus.OK).json(image);
});

router.get('/', async (req, res, next) => {
  let result;
  await Images.smartQuery(req.query)
    .then((images) => {
      result = images;
      return Images.smartCount(req.query);
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

export default router;
