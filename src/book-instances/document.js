import mongoose from 'mongoose';
import { DateTime } from 'luxon';

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema({
  book: { type: Schema.ObjectId, ref: 'books', required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance',
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for this bookinstance object's URL.
BookInstanceSchema.virtual('url').get(function () {
  return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema.virtual('due_back_formatted').get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate(); //format 'YYYY-MM-DD'
});

export const BookInstances = mongoose.model(
  'book_instances',
  BookInstanceSchema
);
