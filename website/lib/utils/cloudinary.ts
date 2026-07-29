import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileInput: string,
  folderPath: string = 'Ecommerce/Products'
): Promise<string> {
  if (!fileInput) throw new Error('No image payload provided.');

  if (
    fileInput.startsWith('http://') ||
    fileInput.startsWith('https://')
  ) {
    if (fileInput.includes('cloudinary.com')) {
      return fileInput;
    }
  }

  const result = await cloudinary.uploader.upload(fileInput, {
    folder: folderPath,
    resource_type: 'auto',
  });

  return result.secure_url;
}

export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return false;

    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return false;

    const pathAfterUpload = parts[1];
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));

    if (!publicId) return false;

    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err);
    return false;
  }
}

export async function deleteProductFolderFromCloudinary(
  productName: string,
  images: string[] = []
): Promise<boolean> {
  try {
    for (const imgUrl of images) {
      if (imgUrl && imgUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(imgUrl);
      }
    }

    const sanitizedName = productName.trim();
    const folderPath = `Ecommerce/Products/${sanitizedName}`;

    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch (e) {
      // Ignore if folder not empty or not existing
    }
    return true;
  } catch (err) {
    console.error('Failed to delete product folder from Cloudinary:', err);
    return false;
  }
}
