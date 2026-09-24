export type PackSlide = { name: string; image: string };

export function slidesForPack(
  productIds: string[] | undefined,
  catalog: { id: string; name: string; image?: string; images?: string[] }[],
): PackSlide[] {
  return (productIds || []).flatMap((id) => {
    const product = catalog.find((item) => item.id === id);
    if (!product) return [];
    const urls = [product.image, ...(product.images || [])].filter(
      (url): url is string => Boolean(url),
    );
    return [...new Set(urls)].map((image) => ({ name: product.name, image }));
  });
}
