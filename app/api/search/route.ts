import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || '').trim();

    if (!q) {
      return NextResponse.json({
        query: '',
        products: [],
        categories: [],
        themes: [],
        packs: [],
      });
    }

    const lowerQ = q.toLowerCase();

    // Fetch catalog data concurrently
    const [allProducts, allCategories, allThemes, allPacks] = await Promise.all([
      db.getProducts().catch(() => []),
      db.getCategories().catch(() => []),
      db.getThemes().catch(() => []),
      db.getPacks().catch(() => []),
    ]);

    // Map Packs into searchable catalog items
    const packItems = allPacks.map((pack) => {
      let packImg = pack.image;
      if (!packImg && pack.productIds && pack.productIds.length > 0) {
        const matchingProd = allProducts.find((p) => pack.productIds.includes(p.id));
        if (matchingProd) packImg = matchingProd.image;
      }
      if (!packImg) packImg = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500';

      return {
        id: pack.id,
        sku: pack.id,
        name: pack.name,
        slug: pack.slug || pack.id,
        price: pack.price,
        originalPrice: pack.originalPrice,
        image: packImg,
        theme: 'Pack',
        category: 'Bundle Pack',
        description: pack.description || `Pack of ${pack.productIds?.length || 5} craft figurines`,
        ageGroup: '',
        isVisible: true,
        inStock: pack.inStock !== false,
        isPack: true,
      };
    });

    const unifiedCatalog = [...allProducts, ...packItems];

    // Smart Relevance Scoring for Products & Packs
    const matchingProducts = unifiedCatalog
      .filter((p) => p.isVisible !== false)
      .map((p) => {
        const nameLower = p.name.toLowerCase();
        const themeLower = (p.theme || '').toLowerCase();
        const categoryLower = (p.category || '').toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        const skuClean = (p.sku || '').toLowerCase().replace(/^prod-/, '').replace(/^pack-/, '');
        const ageLower = (p.ageGroup || '').toLowerCase();

        let score = 0;

        // Exact & Prefix Name Matches (Highest Priority)
        if (nameLower === lowerQ) {
          score += 100;
        } else if (nameLower.startsWith(lowerQ) || nameLower.split(' ').some((word) => word.startsWith(lowerQ))) {
          score += 80;
        } else if (nameLower.includes(lowerQ)) {
          score += 60;
        }

        // Theme and Category Matches (Secondary Priority)
        if (themeLower.includes(lowerQ)) {
          score += 40;
        }
        if (categoryLower.includes(lowerQ)) {
          score += 30;
        }

        // SKU / Age Group Matches
        if (lowerQ.length >= 3 && skuClean && skuClean.includes(lowerQ)) {
          score += 20;
        }
        if (ageLower && ageLower.includes(lowerQ)) {
          score += 20;
        }

        // Description Matches (Only for queries >= 3 chars)
        if (lowerQ.length >= 3 && descLower.includes(lowerQ)) {
          score += 10;
        }

        return { product: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.product);

    // Filter Themes
    const matchingThemes = allThemes
      .filter((t) => t.isVisible !== false && (t.name.toLowerCase().includes(lowerQ) || t.slug.toLowerCase().includes(lowerQ)))
      .slice(0, 3);

    // Filter Categories
    const matchingCategories = allCategories
      .filter((c) => c.isVisible !== false && (c.name.toLowerCase().includes(lowerQ) || c.slug.toLowerCase().includes(lowerQ)))
      .slice(0, 3);

    const response = NextResponse.json({
      query: q,
      products: matchingProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        theme: p.theme,
        category: p.category,
        inStock: p.inStock !== false,
        isPack: (p as any).isPack || false,
      })),
      themes: matchingThemes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        icon: t.icon,
      })),
      categories: matchingCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      packs: allPacks.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
      })),
    });

    response.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
    return response;
  } catch (error: any) {
    console.error('Error in Search API:', error);
    return NextResponse.json(
      { error: 'Failed to search catalog', query: '', products: [], categories: [], themes: [], packs: [] },
      { status: 500 }
    );
  }
}
