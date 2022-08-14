import authorRest from '../authors/rest.js';
import bookRest from '../books/rest.js';
import imageRest from '../images/rest.js';
import genreRest from '../genres/rest.js';

import { authenticatedJWT } from '../middlewares/auth-jwt.js';

import express from 'express';
import expressAsyncHandler from 'express-async-handler';
const router = express.Router();

router.use('/authors', expressAsyncHandler(authorRest));
router.use('/books', expressAsyncHandler(bookRest));
router.use('/images', expressAsyncHandler(imageRest));
router.use('/genres', expressAsyncHandler(genreRest));

export default router;
