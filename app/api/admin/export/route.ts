import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const COLUMNS = [
  'SKU',
  'Name',
  'Category',
  'Material',
  'Price',
  'Quantity',
  'Description',
  'Available',
] as const;

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: products, error } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (products || []).map((p: any) => ({
    SKU: p.sku || '',
    Name: p.name,
    Category: p.category,
    Material: p.material || '',
    Price: p.price ?? '',
    Quantity: p.quantity ?? 1,
    Description: p.description || '',
    Available: p.is_available ? 'Yes' : 'No',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] });
  worksheet['!cols'] = [
    { wch: 14 }, // SKU
    { wch: 28 }, // Name
    { wch: 18 }, // Category
    { wch: 28 }, // Material
    { wch: 10 }, // Price
    { wch: 10 }, // Quantity
    { wch: 50 }, // Description
    { wch: 10 }, // Available
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="agavai-inventory-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
    },
  });
}
