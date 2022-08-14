import fs from 'fs';
import { uploads } from './cloudinary.js';

// export const uploadFileHelper = async (file) => {
//   const uploader = async (path) => await uploads(path, 'Images');
//   const { path } = file;
//   const newPath = await uploader(path);
//   fs.unlinkSync(path);
//   return newPath;
// };

export const uploadFileHelper = async (fileData) => {
  return new Promise(async (resolve, reject) => {
    console.log('uploadFileHelper');
    const uploader = async (path) => await uploads(path, 'Images');
    const { path } = fileData;
    const newPath = await uploader(path);
    fs.unlinkSync(path);
    // return { url: newPath.url, id: newPath.public_id };
    resolve({ url: newPath.url, id: newPath.public_id });
  });
};

export const fileUploadHelper = async (bookId, file) => {
  const uploader = async (path) => await uploads(path, 'Images');
  if (bookId && file) {
    const { path } = file;
    const newPath = await uploader(path);
    fs.unlinkSync(path);

    return Images.create(newPath).then((instance) => {
      return Books.findByIdAndUpdate(
        bookId,
        {
          $push: {
            book_images: instance._id,
          },
        },
        { new: true, useFindAndModify: false }
      ).catch((err) => {
        console.error(err);
      });
    });
  } else {
    const err = new ApiError('BAD_REQUEST', httpStatus.BAD_REQUEST, true);
    return Promise.reject(err);
  }
};
