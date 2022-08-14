import Joi from 'joi';

export const updateAuthor = Joi.object().keys({
  author_code: Joi.string().required().label('Author code'),
  author_name: Joi.string().required().label('First name'),
  family_name: Joi.string().required().label('Family name'),
  //   date_of_birth: Joi.string().required().label('date of birth'),
});

export const createAuthor = Joi.object().keys({
  author_code: Joi.string().required().label('Author code'),
  first_name: Joi.string().required().label('First name'),
  family_name: Joi.string().required().label('Family name'),
});

export const createBook = Joi.object().keys({
  title: Joi.string().optional().allow('').required().label('Title'),
  summary: Joi.string().optional().allow('').required().label('Summary'),
  isbn: Joi.string().optional().allow('').required().label('Isbn'),
  images: Joi.array()
    .optional()
    .items()
    // Joi.object({
    //   url: Joi.string().optional().allow('').required().label('Image URL'),
    //   id: Joi.string().optional().allow('').required().label('Image ID'),
    // })
    // .required()
    .label('Images'),
  authors: Joi.array().optional().items().required().label('Authors'),
  genres: Joi.array().optional().items().required().label('Genres'),
});

export const updateBook = Joi.object().keys({
  title: Joi.string().optional().allow('').required().label('Title'),
  summary: Joi.string().optional().allow('').required().label('Summary'),
  isbn: Joi.string().optional().allow('').required().label('Isbn'),
});

export const createGenre = Joi.object().keys({
  name: Joi.string().optional().allow('').required().label('Genre name'),
});

export const updateGenre = Joi.object().keys({
  name: Joi.string().optional().allow('').required().label('Genre name'),
});
