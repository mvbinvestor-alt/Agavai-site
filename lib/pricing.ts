// Shared "is this product on sale" logic, used both server-side (order
// creation — the only place that actually sets what a customer is charged)
// and client-side (product card / product page display). A product counts
// as on sale only when sale_price is a positive number strictly less than
// price — anything else (null, 0, negative, or >= price) is treated as not
// on sale, so a stray bad value can never make something more expensive or
// free.

type PriceFields = { price: number | null; sale_price?: number | null };

export function isOnSale(product: PriceFields): boolean {
  return (
    product.price != null &&
    product.sale_price != null &&
    product.sale_price > 0 &&
    product.sale_price < product.price
  );
}

// The price that should actually be charged / displayed as the "real" price.
export function getEffectivePrice(product: PriceFields): number | null {
  if (product.price == null) return null;
  return isOnSale(product) ? (product.sale_price as number) : product.price;
}

// Whole-number percent off, or null when not on sale.
export function getDiscountPercent(product: PriceFields): number | null {
  if (!isOnSale(product)) return null;
  const price = product.price as number;
  const salePrice = product.sale_price as number;
  return Math.round((1 - salePrice / price) * 100);
}
