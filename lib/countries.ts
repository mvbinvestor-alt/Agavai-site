import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

export interface CountryOption {
  code: string; // ISO 3166-1 alpha-2, e.g. "IN"
  name: string; // e.g. "India"
  dialCode: string; // e.g. "91"
}

let cached: CountryOption[] | null = null;

export function getCountryOptions(): CountryOption[] {
  if (cached) return cached;

  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const options = getCountries()
    .map((code) => {
      let name: string = code;
      try {
        name = names.of(code) || code;
      } catch {
        // unrecognized region code — fall back to showing the code itself
      }
      return { code, name, dialCode: getCountryCallingCode(code) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Put India first — the overwhelming majority of orders.
  const india = options.find((o) => o.code === 'IN');
  const rest = options.filter((o) => o.code !== 'IN');
  cached = india ? [india, ...rest] : options;
  return cached;
}
