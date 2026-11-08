export const HOME_STATUSES = ['Shortlisted', 'Visit planned', 'Visited', 'Discarded'] as const;
export type HomeStatus = (typeof HOME_STATUSES)[number];

export interface Home {
  readonly id: string;
  readonly title: string;
  readonly address: string;
  readonly price: number;
  readonly fees: number;
  readonly deposit?: number;
  readonly sqm: number;
  readonly rooms: number;
  readonly bathrooms: number;
  readonly floor: number;
  readonly energy: string;
  readonly lat: number;
  readonly lng: number;
  readonly status: HomeStatus;
  readonly notes: string;
  readonly url: string;
  readonly photo: string;
  readonly elevator: boolean;
  readonly outdoor: boolean;
}
