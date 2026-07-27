import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../config/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecommerce-website-pink-eight.vercel.app';

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const resProducts = await fetch(`${API_BASE_URL}/api/products`);
    const products = await resProducts.json();
    if (Array.isArray(products)) {
      productUrls = products.map((product: any) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    const resCategories = await fetch(`${API_BASE_URL}/api/categories`);
    const categories = await resCategories.json();
    if (Array.isArray(categories)) {
      categoryUrls = categories.map((cat: any) => ({
        url: `${baseUrl}/shop?category=${encodeURIComponent(cat.slug || cat.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (_) {}

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bundles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...productUrls,
    ...categoryUrls,
  ];
}
