import { Destination, Home, TravelMode } from './home.model';

export function googleMapsRoute(home: Home, destination: Destination, mode: TravelMode): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${home.lat},${home.lng}`,
    destination: destination.address,
    travelmode: mode,
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
