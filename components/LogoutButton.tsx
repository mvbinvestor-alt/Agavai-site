'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      style={{
        background: 'none',
        border: 'none',
        textDecoration: 'underline',
        fontSize: 13,
        cursor: 'pointer',
        color: 'var(--ink-soft)',
        padding: 0,
      }}
    >
      Log out
    </button>
  );
}
