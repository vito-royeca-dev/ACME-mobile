const toRadians = (degrees) => degrees * Math.PI / 180;

const haversineDistance = (point1, point2) => {
    const [lon1, lat1] = point1.map(toRadians);
    const [lon2, lat2] = point2.map(toRadians);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const earthRadiusMiles = 3958.8;
    return earthRadiusMiles * c;
};

const pointOnRoute = (point, route, tolerance) => {
    for (let i = 0; i < route.length - 1; i++) {
        const segmentStart = route[i];
        const segmentEnd = route[i + 1];

        const distToStart = haversineDistance(point, segmentStart);
        const distToEnd = haversineDistance(point, segmentEnd);
        const segmentLength = haversineDistance(segmentStart, segmentEnd);

        // Point-to-segment distance using the perpendicular distance formula
        const s = (distToStart + distToEnd + segmentLength) / 2;
        const area = Math.sqrt(s * (s - distToStart) * (s - distToEnd) * (s - segmentLength));
        const distance = (2 * area) / segmentLength;

        if (distance <= tolerance) {
            return true;
        }
    }
    return false;
};

const routeOnRoute = (distance, baseRoute, comparisonRoute) => {
  const tolerance = distance * 0.01; // Set tolerance as 1% of the total route length

  for (const point of comparisonRoute) {
      if (!pointOnRoute(point, baseRoute, tolerance)) {
          return false;
      }
  }
  return true;
};

export const calculateTunnelCredits = (distance, baseRouteinfo, comparisonRoutes) => {
  let total = 0;
  const comparisonRouteCoords = comparisonRoutes.map(c => ({...c.coordinates}));

  comparisonRouteCoords.map(comparisonRoute => {
    if (routeOnRoute(distance, baseRouteinfo.coordinates, comparisonRoute)) {
        total += baseRouteinfo.credits;
    }
  });
  
  return total;
}

