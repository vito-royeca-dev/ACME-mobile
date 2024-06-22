import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const toRadians = (degrees) => degrees * Math.PI / 180;
const earthRadiusMiles = 3958.8;

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message: 'This app needs to access your location',
        buttonPositive: 'OK'
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization();
    return true;
  }
};

export const formatDistance = (meters) => {
  const miles = meters * 0.000621371; // Conversion from meters to miles
  return parseInt(miles) + ' mi';
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} h ${minutes} m`;
};

export const createCirclePolygon = (center, radius) => {
  const points = 64;
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };
  const km = radius * 1.60934; // Convert miles to kilometers
  const ret = [];
  const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]); // Close the polygon
  return ret;
};

const polylineToSegments = (polyline) => {
  const segments = [];
  for (let i = 0; i < polyline.length - 1; i++) {
    segments.push([polyline[i], polyline[i + 1]]);
  }
  return segments;
};

const isLineSegmentIntersectCircle = (start, end, circle) => {
  const [circleLon, circleLat, radius] = circle;
  const circleCenter = [circleLon, circleLat];
  
  const distStartToCircle = haversineDistance(start, circleCenter);
  const distEndToCircle = haversineDistance(end, circleCenter);

  // If either endpoint is inside the circle, there is an intersection
  if (distStartToCircle <= radius || distEndToCircle <= radius) {
      return true;
  }

  // Calculate the closest point on the line segment to the circle center
  const [lon1, lat1] = start.map(toRadians);
  const [lon2, lat2] = end.map(toRadians);
  const [clon, clat] = circleCenter.map(toRadians);
  
  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;

  const A = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));

  const d = earthRadiusMiles * C;

  const b = Math.sqrt(distStartToCircle ** 2 - radius ** 2);
  const c = Math.sqrt(distEndToCircle ** 2 - radius ** 2);

  if (b + c <= d) {
      return true;
  }

  return false;
};

export const haversineDistance = (point1, point2) => {
  const [lon1, lat1] = point1.map(toRadians);
  const [lon2, lat2] = point2.map(toRadians);
  
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
};

export const isPointInCircle = (point, center, radius) => {
  
  const [lon1, lat1] = point;
  const [lon2, lat2] = center;
  const distance = haversineDistance([lon1, lat1], [lon2, lat2]);
  
  return distance <= radius;
};

export const pointOnRoute = (point, route, tolerance) => {
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

const routeOnRoute = (baseRouteinfo, comparisonRoute) => {
  const tolerance = baseRouteinfo.distance * 0.000621371 * 0.005; // Set tolerance as 1% of the total route length
  for (const point of comparisonRoute) {
      if (!pointOnRoute(point, baseRouteinfo?.geometry?.coordinates, tolerance)) {
          return false;
      }
  }
  return true;
};

export const calculateCircleCredits = (circles, routes) => {
  const routeSegments = polylineToSegments(routes);
  let totalCredits = 0;

  circles.forEach(circle => {
    const {centerLng, centerLat, radius, credits } = circle;
    for (let i = 0; i < routeSegments.length; i++) {
      const lineSeg = routeSegments[i];
      if (isLineSegmentIntersectCircle(lineSeg[0], lineSeg[1], [centerLng, centerLat, radius])) {
        totalCredits += credits;
        break;
      }
    }
  });

  return totalCredits;
}

export const calculateTunnelCredits = (baseRouteinfo, tunnels) => {
  let total = 0;
  tunnels.map(comparationTunnel => {
    if (routeOnRoute(baseRouteinfo, comparationTunnel.coordinates)) {
        total += comparationTunnel.credits;
    }
  });

  return total;
}

export const calculateCredits = (baseRoute, circles, tunnels) => {
  const circleCredits = calculateCircleCredits(circles, baseRoute?.geometry?.coordinates);
  const  tunnelCredits = calculateTunnelCredits(baseRoute, tunnels);

  return circleCredits + tunnelCredits;
}

export const calculateDistance = (loc1, loc2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);
  const lat1 = toRadians(loc1.latitude);
  const lat2 = toRadians(loc2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};