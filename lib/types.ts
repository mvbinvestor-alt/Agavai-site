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

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';

export interface Order {
  id: string;
  product_id: string | null;
  product_name: string;
  price: number | null;
  quantity: number;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  status: OrderStatus;
  is_dispatched: boolean;
  dispatched_at: string | null;
  razorpay_payment_link_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}
