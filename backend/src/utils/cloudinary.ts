import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

export const uploadToCloudinary = async (
  imageString: string,
  folderPath: string = 'Ecommerce/Products/General'
): Promise<string> => {
  // If image is already an HTTP URL, return as is
  if (imageString.startsWith('http://') || imageString.startsWith('https://')) {
    return imageString;
  }

  try {
    const uploadRes = await cloudinary.uploader.upload(imageString, {
      folder: folderPath
    });
    return uploadRes.secure_url;
  } catch (err) {
    console.warn('Cloudinary upload warning (using fallback image URL):', err);
    return imageString;
  }
};
