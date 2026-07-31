import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSku } from '@/lib/sku';

export const runtime = 'nodejs';

interface ImportRow {
  SKU?: string;
  Name?: string;
  Category?: string;
  Material?: string;
  Price?: number | string;
  Quantity?: number | string;
  Description?: string;
  Available?: string | boolean | number;
}

function parseAvailable(v: ImportRow['Available']): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return !(s === 'no' || s === 'false' || s === '0' || s === '');
  }
  return true;
}

function parseNumber(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  let rows: ImportRow[];
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    rows = XLSX.utils.sheet_to_json<ImportRow>(workbook.Sheets[sheetName], { defval: '' });
  } catch {
    return NextResponse.json({ error: 'Could not read that file. Please upload a valid .xlsx file.' }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows found in that file.' }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: 'Max 500 rows per import.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // account for header row
    const name = String(row.Name || '').trim();
    const category = String(row.Category || '').trim();

    if (!name || !category) {
      errors.push(`Row ${rowNum}: skipped — Name and Category are required.`);
      continue;
    }

    const sku = String(row.SKU || '').trim();
    const payload = {
      name,
      category,
      material: String(row.Material || '').trim() || null,
      price: parseNumber(row.Price),
      quantity: parseNumber(row.Quantity) ?? 1,
      description: String(row.Description || '').trim() || null,
      is_available: parseAvailable(row.Available),
    };

    if (sku) {
      const { data: existing } = await admin
        .from('products')
        .select('id')
        .ilike('sku', sku)
        .maybeSingle();

      if (existing) {
        const { error } = await admin.from('products').update(payload).eq('id', existing.id);
        if (error) {
          errors.push(`Row ${rowNum} (${sku}): ${error.message}`);
        } else {
          updated++;
        }
        continue;
      }
    }

    const { error } = await admin.from('products').insert({
      ...payload,
      sku: sku || generateSku(),
    });

    if (error) {
      errors.push(`Row ${rowNum}${sku ? ` (${sku})` : ''}: ${error.message}`);
    } else {
      created++;
    }
  }

  return NextResponse.json({ created, updated, errors, total: rows.length });
}
