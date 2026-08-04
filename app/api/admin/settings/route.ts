import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { setSetting } from '@/lib/settings';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { key, value } = await req.json();
  if (typeof key !== 'string' || typeof value !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  await setSetting(key, value);
  return NextResponse.json({ ok: true });
}
