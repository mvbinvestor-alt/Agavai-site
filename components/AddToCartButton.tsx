'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({
  productId,
  name,
  price,
  image,
  maxQuantity,
}: {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  maxQuantity: number;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ product_id: productId, name, price, image, maxQuantity }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem({ product_id: productId, name, price, image, maxQuantity }, 1);
    router.push('/checkout');
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button className="btn btn-outline" onClick={handleAdd} type="button">
        {added ? 'Added ✓' : 'Add to Cart'}
      </button>
      <button className="btn" onClick={handleBuyNow} type="button">
        Buy Now
      </button>
    </div>
  );
}
