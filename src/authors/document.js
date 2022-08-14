import mongoose from 'mongoose';
import { DateTime } from 'luxon';
import mongooseSmartQuery from '../shared/mongoose-smart-query.js';

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
  author_code: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author "full" name.
AuthorSchema.virtual('name').get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for this author instance URL.
AuthorSchema.virtual('url').get(function () {
  return '/authors/' + this._id;
});

AuthorSchema.virtual('lifespan').get(function () {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_MED
    );
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_MED
    );
  }
  return lifetime_string;
});

AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});

AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});

AuthorSchema.plugin(mongooseSmartQuery);

export const Authors = mongoose.model('authors', AuthorSchema);
