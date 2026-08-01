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
  restock_message: string | null;
  created_at: string;
  media: ProductMedia[];
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'returned';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  // legacy single-item fields, kept for old rows; new orders use order_items
  product_id: string | null;
  product_name: string;
  price: number | null;
  quantity: number;

  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;

  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  shipping_country: string;

  subtotal: number | null;
  shipping_fee: number;
  total: number | null;

  status: OrderStatus;
  is_dispatched: boolean;
  dispatched_at: string | null;
  razorpay_payment_link_id: string | null;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  paid_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;

  items?: OrderItem[];
}
