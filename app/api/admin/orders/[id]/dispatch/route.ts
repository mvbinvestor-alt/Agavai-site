import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const { is_dispatched } = await req.json();

  const admin = supabaseAdmin();
  const { error } = await admin
    .from('orders')
    .update({
      is_dispatched: !!is_dispatched,
      dispatched_at: is_dispatched ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
