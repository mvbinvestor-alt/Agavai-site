export type MediaType = 'image' | 'video';

export interface ProductMedia {
  id: string;
  product_id: string;
  type: MediaType;
  url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  material: string | null;
  price: number | null;
  quantity: number;
  description: string | null;
  is_available: boolean;
  created_at: string;
  media: ProductMedia[];
}
