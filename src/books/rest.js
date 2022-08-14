import { Authors } from '../authors/document.js';
import { Books } from '../books/document.js';
import { badRequest, notFound } from '../middlewares/exceptions.js';
import upload from '../shared/multer.js';
import { uploads } from '../shared/cloudinary.js';
import {
  createAuthor,
  createBook,
  updateAuthor,
  updateBook,
} from '../core/param-validation.js';
import { validate } from '../core/validate.js';
import { Images } from '../images/document.js';
import ApiError from '../shared/api-error.js';
import { uploadFileHelper } from '../shared/file-upload-util.js';

import httpStatus from 'http-status';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.param('id', async (req, res, next, id) => {
  await Books.findById(id)
    .then((_book) => {
      if (_book) {
        req.book = _book;
        next(); // next to PUT or DELETE, those use this helper
        return null;
      }
      const err = new ApiError('자료 없음', httpStatus.NOT_FOUND, true);
      res.status(httpStatus.NOT_FOUND).json(err);
      // return Promise.reject(err);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  const { book } = req;
  return res.status(httpStatus.OK).json(book);
});

router.post(
  '/',
  upload.array('images', 3),
  validate(createBook),
  async (req, res, next) => {
    const bookId = new mongoose.mongo.ObjectId();
    let bookToCreate = new Books({
      _id: bookId,
      ...req.body,
    });

    await Books.create(bookToCreate)
      .then(async (_book) => {
        if (req.files) {
          req.files.forEach(async (aFile) => {
            await uploadFileHelper(aFile).then(async (_file) => {
              console.log('_file');
              async function update() {
                return await new Promise((resolve, reject) => {
                  setTimeout(() => {
                    _book
                      .updateOne({ $push: { images: _file } })
                      .catch((err) => reject(err));
                    resolve();
                  }, 5000);
                });
              }
              await update();
            });
          });
        }

        console.log('return res.status(httpStatus.OK).json(_book)');
        return res.status(httpStatus.OK).json(_book);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  }
);

router.get('/', async (req, res, next) => {
  let result;
  await Books.smartQuery(req.query)
    .then((books) => {
      result = books;
      return Books.smartCount(req.query);
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

router.put('/:id', validate(updateBook), async (req, res, next) => {});

router.delete('/:id', async (req, res, next) => {
  const { book } = req;
  await book
    .remove()
    .then((response) => res.httpStatus(httpStatus.OK).json(response))
    .catch((err) => {
      next(err);
    });
});

export default router;
