import { HOME_STATUSES, Home, TRAVEL_MODES, Workspace, WorkspaceBackup } from './home.model';

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

/** One runtime contract for form submissions, stored records and imported records. */
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

/** Accepts the original unversioned IndexedDB payload and normalizes its missing mode. */
export function parseWorkspace(value: unknown): Workspace {
  if (!isRecord(value) || !Array.isArray(value['homes']) || !value['homes'].every(isHome)) {
    throw new Error('Invalid home records.');
  }
  const homes = value['homes'];
  if (new Set(homes.map((home) => home.id)).size !== homes.length)
    throw new Error('Duplicate home identifiers.');
  const destinations = value['destinations'];
  if (
    !Array.isArray(destinations) ||
    destinations.length !== 2 ||
    !destinations.every(
      (destination) =>
        isRecord(destination) &&
        typeof destination['name'] === 'string' &&
        typeof destination['address'] === 'string',
    )
  ) {
    throw new Error('Exactly two valid destinations are required.');
  }
  const mode = value['mode'] ?? 'transit';
  if (!TRAVEL_MODES.some((item) => item === mode) || typeof value['demo'] !== 'boolean') {
    throw new Error('Invalid workspace settings.');
  }
  // Reconstruct known fields rather than retaining arbitrary imported properties.
  return structuredClone({
    homes: homes.map((home) => ({
      id: home.id,
      title: home.title,
      address: home.address,
      price: home.price,
      fees: home.fees,
      sqm: home.sqm,
      rooms: home.rooms,
      bathrooms: home.bathrooms,
      floor: home.floor,
      energy: home.energy,
      lat: home.lat,
      lng: home.lng,
      status: home.status,
      notes: home.notes,
      url: home.url,
      photo: home.photo,
      elevator: home.elevator,
      outdoor: home.outdoor,
    })),
    destinations: destinations.map((destination) => ({
      name: destination.name,
      address: destination.address,
    })),
    mode,
    demo: value['demo'],
  }) as Workspace;
}

export function parseBackup(text: string): Workspace {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || value['version'] !== 1) throw new Error('Unsupported backup version.');
  return parseWorkspace(value);
}

export function serializeBackup(workspace: Workspace): string {
  const backup: WorkspaceBackup = { ...parseWorkspace(workspace), version: 1 };
  return JSON.stringify(backup, null, 2);
}
