import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'agavai_admin';

function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD || '';
  return crypto.createHmac('sha256', password).update('agavai-admin-session').digest('hex');
}

export function checkPassword(password: string): boolean {
  return password.length > 0 && password === process.env.ADMIN_PASSWORD;
}

export function adminCookieValue(): string {
  return expectedToken();
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return !!value && value === expectedToken();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
