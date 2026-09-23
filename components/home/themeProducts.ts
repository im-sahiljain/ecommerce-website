import type { Product } from "./homeTypes";

export function productsForTheme(
  products: Product[],
  themeKeyword: string,
  productLineId?: string,
): Product[] {
  const keyword = themeKeyword.toLowerCase().trim();
  return products
    .filter((product) => {
      if (product.isVisible === false) return false;
      if (productLineId && product.productLineId === productLineId) return true;
      const theme = product.theme?.toLowerCase().trim() || "";
      if (!keyword || !theme || theme === "general") return false;
      return theme.includes(keyword) || keyword.includes(theme);
    })
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
}
