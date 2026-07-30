import Link from 'next/link';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';
import AdminProductList from '@/components/AdminProductList';
import LogoutButton from '@/components/LogoutButton';
import type { Product } from '@/lib/types';

export const revalidate = 0;

async function getAllProducts(): Promise<Product[]> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('products')
    .select('*, media:product_media(*)')
    .order('created_at', { ascending: false });

  return (data || []).map((p: any) => ({
    ...p,
    media: (p.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));
}

export default async function AdminPage() {
  if (!isAdminAuthed()) {
    return <AdminLogin />;
  }

  const products = await getAllProducts();

  return (
    <div className="admin-shell">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Products ({products.length})</h2>
        <Link href="/admin/new" className="btn">
          + Add product
        </Link>
      </div>

      <AdminProductList products={products} />

      <div style={{ marginTop: 30 }}>
        <a href="/" style={{ fontSize: 13, marginRight: 16 }}>
          View live site
        </a>
        <LogoutButton />
      </div>
    </div>
  );
}

