import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const theme = searchParams.get('theme');
    const category = searchParams.get('category');
    const ageGroup = searchParams.get('ageGroup');
    const search = searchParams.get('search');

    let products = await db.getProducts();

    if (theme) {
      products = products.filter((p) => p.theme.toLowerCase() === theme.toLowerCase());
    }
    if (category) {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (ageGroup) {
      products = products.filter((p) => p.ageGroup.toLowerCase() === ageGroup.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(products, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      price,
      originalPrice,
      theme,
      category,
      ageGroup,
      isNonToxic,
      image,
      images,
      description,
      inStock,
      featured,
      badge,
      isNewLaunch,
      isSellingFast,
      size,
      material,
      isVisible,
    } = body;

    if (!name || !price || !theme || !category || !ageGroup) {
      return NextResponse.json(
        { error: 'Missing required product fields (name, price, theme, category, ageGroup)' },
        { status: 400 }
      );
    }

    const folderPath = `Ecommerce/Products/${name.trim()}`;
    let processedImages: string[] = [];

    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const uploadedUrl = await uploadToCloudinary(img, folderPath);
          processedImages.push(uploadedUrl);
        } else if (typeof img === 'string') {
          processedImages.push(img);
        }
      }
    } else if (image) {
      if (typeof image === 'string' && image.startsWith('data:image')) {
        const uploadedUrl = await uploadToCloudinary(image, folderPath);
        processedImages.push(uploadedUrl);
      } else if (typeof image === 'string') {
        processedImages.push(image);
      }
    }

    if (processedImages.length === 0) {
      processedImages.push(
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500'
      );
    }

    const newProduct = await db.addProduct({
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      theme,
      category,
      ageGroup,
      isNonToxic: Boolean(isNonToxic),
      image: processedImages[0],
      images: processedImages,
      description: description || '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      featured: Boolean(featured),
      badge: badge || undefined,
      isNewLaunch: Boolean(isNewLaunch),
      isSellingFast: Boolean(isSellingFast),
      size: size || undefined,
      material: material || undefined,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    });

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
