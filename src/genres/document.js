import mongoose from 'mongoose';
import mongooseSmartQuery from '../shared/mongoose-smart-query.js';

var Schema = mongoose.Schema;

var GenreSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    image: {
      url: { type: String, trim: true },
      id: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for this genre instance URL.
GenreSchema.virtual('url').get(function () {
  return '/genres/' + this._id;
});

GenreSchema.plugin(mongooseSmartQuery);

export const Genres = mongoose.model('genres', GenreSchema);
