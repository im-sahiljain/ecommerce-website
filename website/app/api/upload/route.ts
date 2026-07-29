import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, productName } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data or URL required' }, { status: 400 });
    }

    if (typeof image === 'string' && image.startsWith('data:image')) {
      const base64Content = image.includes(',') ? image.split(',')[1] : image;
      const sizeInBytes = Math.ceil((base64Content.length * 3) / 4);
      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

      if (sizeInBytes > MAX_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 2 MB limit' },
          { status: 400 }
        );
      }
    }

    const sanitizedName = (productName || 'General').trim();
    const folderPath = `Ecommerce/Products/${sanitizedName}`;

    const url = await uploadToCloudinary(image, folderPath);
    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
