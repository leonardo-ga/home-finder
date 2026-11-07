export const HOME_STATUSES = ['Shortlisted', 'Visit planned', 'Visited', 'Discarded'] as const;
export type HomeStatus = (typeof HOME_STATUSES)[number];

export interface Home {
  readonly id: string;
  title: string;
  address: string;
  price: number;
  fees: number;
  sqm: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  energy: string;
  lat: number;
  lng: number;
  status: HomeStatus;
  notes: string;
  url: string;
  photo: string;
  elevator: boolean;
  outdoor: boolean;
}

export interface Destination {
  name: string;
  address: string;
}

export const TRAVEL_MODES = ['transit', 'driving', 'bicycling', 'walking'] as const;
export type TravelMode = (typeof TRAVEL_MODES)[number];
export type Destinations = [Destination, Destination];

export interface CommuteSettings {
  destinations: Destinations;
  mode: TravelMode;
}

export interface Workspace extends CommuteSettings {
  homes: Home[];
  demo: boolean;
}

export interface WorkspaceBackup extends Workspace {
  version: 1;
}

export interface HomeFilters {
  query: string;
  maxPrice: number | null;
  minSqm: number | null;
  status: HomeStatus | 'All statuses';
  sort: 'recent' | 'price' | 'size';
}

export const DEFAULT_FILTERS: HomeFilters = {
  query: '',
  maxPrice: null,
  minSqm: null,
  status: 'All statuses',
  sort: 'recent',
};

export function createHome(): Home {
  return {
    id: crypto.randomUUID(),
    title: '',
    address: '',
    price: 0,
    fees: 0,
    sqm: 0,
    rooms: 1,
    bathrooms: 1,
    floor: 0,
    energy: 'Unknown',
    lat: 45.4642,
    lng: 9.19,
    status: 'Shortlisted',
    notes: '',
    url: '',
    photo: '',
    elevator: false,
    outdoor: false,
  };
}
