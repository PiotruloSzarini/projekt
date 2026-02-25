import { v2 as cloudinary } from 'cloudinary';

CLOUDINARY_CLOUD_NAME=ds6xrritb
CLOUDINARY_API_KEY=132975987282295
CLOUDINARY_API_SECRET=MsZmqA5DCn6O_mFFnsZb1b53d_E

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;