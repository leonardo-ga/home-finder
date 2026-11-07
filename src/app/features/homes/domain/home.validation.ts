import { HOME_STATUSES, Home } from './home.model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value === '') return true;
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password
    );
  } catch {
    return false;
  }
}

/** Validate source-controlled catalogue records in checks and tests. */
export function isHome(value: unknown): value is Home {
  if (!isRecord(value)) return false;
  const strings = ['id', 'title', 'address', 'energy', 'notes'] as const;
  const numbers = ['price', 'fees', 'sqm', 'rooms', 'bathrooms', 'floor', 'lat', 'lng'] as const;
  if (!strings.every((key) => typeof value[key] === 'string')) return false;
  if (!numbers.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key])))
    return false;
  // The field checks above make this cast safe for the remaining value constraints.
  const home = value as unknown as Home;
  return (
    home.id.trim().length > 0 &&
    home.title.trim().length > 0 &&
    home.address.trim().length > 0 &&
    home.price > 0 &&
    home.fees >= 0 &&
    home.sqm > 0 &&
    Number.isInteger(home.rooms) &&
    home.rooms >= 1 &&
    Number.isInteger(home.bathrooms) &&
    home.bathrooms >= 1 &&
    Number.isInteger(home.floor) &&
    Math.abs(home.lat) <= 90 &&
    Math.abs(home.lng) <= 180 &&
    HOME_STATUSES.includes(home.status) &&
    typeof home.elevator === 'boolean' &&
    typeof home.outdoor === 'boolean' &&
    isHttpUrl(home.url) &&
    isHttpUrl(home.photo)
  );
}
