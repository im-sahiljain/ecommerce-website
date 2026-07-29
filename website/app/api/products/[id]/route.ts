import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteProductFolderFromCloudinary,
} from '@/lib/utils/cloudinary';
import { revalidatePath } from 'next/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    db.recordProductView(id);
    return NextResponse.json(product, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingProduct = await db.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldImages: string[] = Array.from(
      new Set([
        ...(existingProduct.images || []),
        ...(existingProduct.image ? [existingProduct.image] : []),
      ])
    );

    const updates = await req.json();
    const productName = updates.name || existingProduct.name || 'General';
    const folderPath = `Ecommerce/Products/${productName.trim()}`;

    if (Array.isArray(updates.images)) {
      const uploadedList: string[] = [];
      for (const img of updates.images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const uploadedUrl = await uploadToCloudinary(img, folderPath);
          uploadedList.push(uploadedUrl);
        } else if (typeof img === 'string') {
          uploadedList.push(img);
        }
      }
      updates.images = uploadedList;
      if (uploadedList.length > 0) {
        updates.image = uploadedList[0];
      }

      const removedImages = oldImages.filter((oldUrl) => !uploadedList.includes(oldUrl));
      for (const removedUrl of removedImages) {
        if (removedUrl && removedUrl.includes('cloudinary.com')) {
          await deleteFromCloudinary(removedUrl);
        }
      }
    } else if (updates.image && typeof updates.image === 'string' && updates.image.startsWith('data:image')) {
      updates.image = await uploadToCloudinary(updates.image, folderPath);
      updates.images = [updates.image];

      const removedImages = oldImages.filter((oldUrl) => oldUrl !== updates.image);
      for (const removedUrl of removedImages) {
        if (removedUrl && removedUrl.includes('cloudinary.com')) {
          await deleteFromCloudinary(removedUrl);
        }
      }
    }

    const updated = await db.updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath(`/product/${id}`);
    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imagesToDelete: string[] = Array.from(
      new Set([
        ...(product.images || []),
        ...(product.image ? [product.image] : []),
      ])
    );

    await deleteProductFolderFromCloudinary(product.name, imagesToDelete);

    const success = await db.deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product delete failed' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
