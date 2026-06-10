// Calculates the distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

// Converts a string like "10 km" or "Citywide" into a numeric kilometer limit
export function parseTravelRadius(radiusStr: string): number {
  if (!radiusStr || radiusStr === 'Citywide') return 50; // Assume citywide means ~50km
  const num = parseInt(radiusStr.replace(/\D/g, ''));
  return isNaN(num) ? 10 : num;
}