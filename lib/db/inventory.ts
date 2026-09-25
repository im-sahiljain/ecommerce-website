import type { Product, ProductAnalytics, StockLog } from './types';
import type { Db } from './pool';
import { getProductById } from './products';

export async function adjustProductStock(db: Db, 
  productId: string,
  changeAmount: number,
  _reason: string,
  _updatedBy: string = 'Admin'
): Promise<Product | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const product = await getProductById(db, productId);
    if (!product) return null;
    const currentQty = product.stockQuantity !== undefined ? product.stockQuantity : 10;
    const newQty = Math.max(0, currentQty + changeAmount);
    await pool.query(
      `UPDATE public.products SET stock_quantity = $1, in_stock = $2 WHERE id = $3`,
      [newQty, newQty > 0, productId]
    );
    return { ...product, stockQuantity: newQty, inStock: newQty > 0 };
  } catch (err: any) {
    console.warn('⚠️ PG adjustProductStock error:', err.message);
    return null;
  }
}

export async function getStockLogs(db: Db, _productId?: string): Promise<StockLog[]> {
  return [];
}

export function getProductAnalytics(db: Db, _productId: string): ProductAnalytics {
  return {
    productId: _productId,
    views: 0,
    likes: 0,
    wishlistedBy: [],
    unitsOrdered: 0,
    totalRevenue: 0,
  };
}

export function recordProductView(db: Db, _productId: string): void {}

export async function likeProduct(db: Db, 
  productId: string,
  active: boolean
): Promise<{ likes: number; isLiked: boolean }> {
  const delta = active ? 1 : -1;
  const pool = db.pgPool;
  if (pool) {
    try {
      const res = await pool.query(
        `UPDATE public.products
         SET likes_count = GREATEST(COALESCE(likes_count, 0) + $2, 0)
         WHERE id = $1
         RETURNING likes_count`,
        [productId, delta]
      );
      if (res.rows.length > 0) {
        return { likes: Number(res.rows[0].likes_count), isLiked: active };
      }
    } catch (err: any) {
      console.warn('⚠️ PG likeProduct error:', err.message);
    }
  }
  return { likes: active ? 1 : 0, isLiked: active };
}

export function getAllAnalytics(db: Db): Record<string, ProductAnalytics> {
  return {};
}
