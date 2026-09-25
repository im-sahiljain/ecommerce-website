export type PackSlide = { name: string; image: string };

export function slidesForPack(
  productIds: string[] | undefined,
  catalog: { id: string; name: string; image?: string; images?: string[] }[],
): PackSlide[] {
  return (productIds || []).flatMap((id) => {
    const product = catalog.find((item) => item.id === id);
    if (!product) return [];
    const image = product.image || product.images?.[0];
    if (!image) return [];
    return [{ name: product.name, image }];
  });
}
