import mongoose from 'mongoose';
import mongooseSmartQuery from '../shared/mongoose-smart-query.js';

var Schema = mongoose.Schema;

var BookSchema = new Schema(
  {
    title: { type: String, required: true },
    authors: [{ type: Schema.ObjectId, ref: 'authors', required: true }],
    summary: { type: String, required: true },
    book_images: [{ type: Schema.Types.ObjectId, ref: 'images' }],
    images: [
      {
        url: { type: String, required: true },
        id: { type: String, required: true },
      },
    ],
    isbn: { type: String, required: true },
    genres: [{ type: Schema.ObjectId, ref: 'genres' }],
  },
  {
    timestamps: true,
  }
);

// Virtual for this book instance URL.
BookSchema.virtual('url').get(function () {
  return '/books/' + this._id;
});

BookSchema.plugin(mongooseSmartQuery);

export const Books = mongoose.model('books', BookSchema);
