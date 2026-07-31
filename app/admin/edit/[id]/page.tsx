import { notFound } from 'next/navigation';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';
import ProductForm from '@/components/ProductForm';
import type { Product } from '@/lib/types';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return <AdminLogin />;
  }

  const { id } = await params;
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('products')
    .select('*, media:product_media(*)')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const product: Product = {
    ...data,
    media: (data.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  };

  return (
    <div className="admin-shell">
      <h2>Edit product</h2>
      <div className="admin-card">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
