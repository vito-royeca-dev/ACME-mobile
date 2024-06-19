import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export  const createCirclePolygon = (center, radius) => {
  const points = 64;
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };
  const km = radius / 1000;
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
    console.log("request permision");

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

export const calculateCredits = (route, circleZones, tunnels) => {
  let totalCredits = 0;

  // Check for tunnels
  tunnels.forEach(tunnel => {
    route.forEach((point, index) => {
      if (index < route.length - 1) {
        const segmentStart = point;
        const segmentEnd = route[index + 1];

        if (isPointInCircle(tunnel.start, tunnel.end, circleZones)) {
          totalCredits += tunnel.credits;
        }

        if (isLineSegmentIntersectCircle(segmentStart, segmentEnd, tunnel)) {
          totalCredits += tunnel.credits;
        }
      }
    });
  });

  // Check for circle zones
  circleZones.forEach(zone => {
    route.forEach(point => {
      if (isPointInCircle(point, zone.center, zone.radius)) {
        totalCredits += zone.credits;
      }
    });
  });

  return totalCredits;
};

const isPointInCircle = (point, center, radius) => {
  const [x, y] = point;
  const [cx, cy] = center;
  const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  return distance <= radius;
};

const isLineSegmentIntersectCircle = (start, end, circle) => {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const [cx, cy] = circle.center;
  const r = circle.radius;

  // Calculate the projection point of the circle center onto the line segment
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const t = ((cx - x1) * dx + (cy - y1) * dy) / (length * length);
  const closestPoint = [
    x1 + t * dx,
    y1 + t * dy,
  ];

  // Check if the closest point is within the line segment
  if (t < 0 || t > 1) {
    return false;
  }

  // Check if the closest point is within the circle
  return isPointInCircle(closestPoint, circle.center, r);
};



// Function to determine the orientation of three points (p, q, r)
const orientation = (p, q, r) => {
  const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
  if (val === 0) return 0; // collinear
  return val > 0 ? 1 : 2; // clock or counterclock wise
};

// Function to check if point q lies on segment pr
const onSegment = (p, q, r) => {
  return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
         q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
};

// Function to check if segments p1q1 and p2q2 intersect
const doIntersect = (p1, q1, p2, q2) => {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  // General case
  if (o1 !== o2 && o3 !== o4) return true;

  // Special cases
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false;
};

// Function to convert polyline (array of coordinates) to segments
const polylineToSegments = (polyline) => {
  const segments = [];
  for (let i = 0; i < polyline.length - 1; i++) {
    segments.push([polyline[i], polyline[i + 1]]);
  }
  return segments;
};

// Function to check if any segment of individual tunnels intersects with the directed tunnel
const checkTunnelsOnDirectedTunnel = (directedTunnel, individualTunnels) => {
  const directedSegments = polylineToSegments(directedTunnel);
  const individualSegments = individualTunnels.map(polylineToSegments).flat();

  for (const directedSegment of directedSegments) {
    for (const individualSegment of individualSegments) {
      if (doIntersect(directedSegment[0], directedSegment[1], individualSegment[0], individualSegment[1])) {
        return true; // Found an intersection
      }
    }
  }
  return false; // No intersections found
};

// Example usage
const directedTunnel = [
  [0, 0], [1, 1], [2, 2], [3, 3], [4, 4]
];

const individualTunnels = [
  [
    [1, 0], [2, 1], [3, 2]
  ],
  [
    [3, 3], [4, 5]
  ]
];
console.log(checkTunnelsOnDirectedTunnel(directedTunnel, individualTunnels)); // Output: true or false based on intersections
