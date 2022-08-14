import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const uploads = (file, folder) => {
//   return new Promise((resolve) => {
//     cloudinary.uploader.upload(
//       file,
//       (result) => {
//         resolve({
//           url: result.url,
//           id: result.public_id,
//         });
//       },
//       {
//         resource_type: 'auto',
//         folder: folder,
//       }
//     );
//   });
// };

export const uploads = (file, folder) => {
  return cloudinary.v2.uploader.upload(
    file,
    {
      resource_type: 'auto',
      folder: folder,
    },
    (err, result) => {
      if (err) console.error(err);
      return { url: result.url, id: result.public_id };
    }
  );
};
