// Shared "is this product on sale" logic, used both server-side (order
// creation — the only place that actually sets what a customer is charged)
// and client-side (product card / product page display).
//
// Two ways a product can be on sale:
//  1. Its own sale_price (set on the product itself) — always wins when set.
//  2. The storewide global discount (admin toggle + percent) — applies to
//     everything that doesn't have its own sale_price set.
// A stray bad value (null, 0, negative, or >= price) never makes anything
// more expensive or free.

type PriceFields = { price: number | null; sale_price?: number | null };

function hasManualSale(product: PriceFields): boolean {
  return (
    product.price != null &&
    product.sale_price != null &&
    product.sale_price > 0 &&
    product.sale_price < product.price
  );
}

function validGlobalPercent(globalDiscountPercent?: number | null): boolean {
  return (
    typeof globalDiscountPercent === 'number' &&
    globalDiscountPercent > 0 &&
    globalDiscountPercent < 100
  );
}

export function isOnSale(product: PriceFields, globalDiscountPercent?: number | null): boolean {
  if (product.price == null) return false;
  if (hasManualSale(product)) return true;
  return validGlobalPercent(globalDiscountPercent);
}

// The price that should actually be charged / displayed as the "real" price.
export function getEffectivePrice(
  product: PriceFields,
  globalDiscountPercent?: number | null
): number | null {
  if (product.price == null) return null;
  if (hasManualSale(product)) return product.sale_price as number;
  if (validGlobalPercent(globalDiscountPercent)) {
    return Math.round(product.price * (1 - (globalDiscountPercent as number) / 100));
  }
  return product.price;
}

// Whole-number percent off, or null when not on sale.
export function getDiscountPercent(
  product: PriceFields,
  globalDiscountPercent?: number | null
): number | null {
  if (!isOnSale(product, globalDiscountPercent)) return null;
  const price = product.price as number;
  const effective = getEffectivePrice(product, globalDiscountPercent) as number;
  return Math.round((1 - effective / price) * 100);
}
