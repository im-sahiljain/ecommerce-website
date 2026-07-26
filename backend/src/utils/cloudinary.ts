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

export const extractCloudinaryPublicId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let afterUpload = parts[1];
    
    // Remove version string v12345678/ if present
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension (.jpg, .png, etc.)
    const lastDotIndex = afterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      afterUpload = afterUpload.substring(0, lastDotIndex);
    }
    return afterUpload;
  } catch (err) {
    return null;
  }
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return false;

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Cloudinary image deleted (${publicId}):`, res.result);
    return res.result === 'ok';
  } catch (err: any) {
    console.warn(`⚠️ Cloudinary deletion notice (${publicId}):`, err.message);
    return false;
  }
};

export const deleteProductFolderFromCloudinary = async (
  productName: string,
  imageUrls: string[] = []
): Promise<boolean> => {
  // Delete all individual product image assets
  for (const url of imageUrls) {
    if (url && url.includes('cloudinary.com')) {
      await deleteFromCloudinary(url);
    }
  }

  const sanitizedName = productName ? productName.trim() : '';
  if (!sanitizedName || sanitizedName.toLowerCase() === 'general') {
    return true;
  }

  const folderPath = `Ecommerce/Products/${sanitizedName}`;

  try {
    // Delete any remaining assets inside the folder
    await cloudinary.api.delete_resources_by_prefix(`${folderPath}/`).catch(() => {});
    
    // Delete the empty folder itself from Cloudinary
    const res = await cloudinary.api.delete_folder(folderPath);
    console.log(`🗑️ Cloudinary folder deleted (${folderPath}):`, res);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ Cloudinary folder deletion notice (${folderPath}):`, err.message);
    return false;
  }
};
