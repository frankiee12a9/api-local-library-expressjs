import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    url: {
      type: String,
    },
    isProfileImage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Images = mongoose.model('images', ImageSchema);
