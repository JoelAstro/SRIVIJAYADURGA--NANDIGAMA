import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    public_id: (req, file) => {
      const name = file.originalname ? file.originalname.split('.')[0] : 'file';
      return `${Date.now()}_${name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    }
  }
});

const parser = multer({ storage: storage });

export { cloudinary, storage, parser as upload };
