'use client';

import { useMemo } from 'react';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { getCountryOptions } from '@/lib/countries';

export function PhoneInput({
  countryCode,
  nationalNumber,
  onCountryChange,
  onNumberChange,
}: {
  countryCode: string;
  nationalNumber: string;
  onCountryChange: (code: string) => void;
  onNumberChange: (value: string) => void;
}) {
  const countries = useMemo(() => getCountryOptions(), []);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select
        value={countryCode}
        onChange={(e) => onCountryChange(e.target.value)}
        style={{ flexShrink: 0, width: 110 }}
        aria-label="Country code"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} +{c.dialCode}
          </option>
        ))}
      </select>
      <input
        placeholder="Phone number"
        type="tel"
        inputMode="tel"
        value={nationalNumber}
        onChange={(e) => onNumberChange(e.target.value)}
        style={{ flex: 1 }}
        required
      />
    </div>
  );
}

// Returns the full E.164 number (e.g. "+919159400333") if valid, else null.
export function toValidatedPhone(countryCode: string, nationalNumber: string): string | null {
  const trimmed = nationalNumber.trim();
  if (!trimmed) return null;
  try {
    if (!isValidPhoneNumber(trimmed, countryCode as any)) return null;
    return parsePhoneNumber(trimmed, countryCode as any).number;
  } catch {
    return null;
  }
}
