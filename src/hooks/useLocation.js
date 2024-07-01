import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { calculateDistance, haversineDistance, isPointInCircle, pointOnRoute, requestPermissions } from '../utils/mapbox';
import { updateCredits, updateLocation } from '../lib/apis';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'auto',
});

export const useLocation = (tunnels, zones) => {
  const [location, setLocation] = useState({});
  const [enteredZones, setEnteredZones] = useState([]);
  const [passedTunnels, setPassedTunnels] = useState([]);
  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestPermissions();

      if (!hasPermission) {
        console.error('Location permission not granted');
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const diff = 0;

          setLocation({ latitude, longitude });
          updateLocation(position.coords, diff);
        },
        err => {
          console.log(err);
        },
        {enableHighAccuracy: true},
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const diff = calculateDistance(position.coords, location) * 0.621371;
          setLocation({ latitude, longitude });
          updateLocation(position.coords, diff);
        },
        err => {
          console.log(err);
        },
        {enableHighAccuracy: true},
      );

      return watchId;
    };

    const watchId = getLocation();

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    }
  }, []);

  useEffect(() => {
    if (!(zones?.length > 1 && tunnels?.length > 1)) return;
    let credits = 0;
    let zoneflag = 0;
    let tunnelflag = 0;

    zones.forEach(zone => {
      const pointOnCircle = isPointInCircle([location.longitude, location.latitude], [zone.centerLng, zone.centerLat], zone.radius);
      if (enteredZones.indexOf(zone._id) === -1 && pointOnCircle) {
        credits += zone.credits;
        setEnteredZones(zones => [...zones, zone._id]);
      } else if (enteredZones.indexOf(zone._id) !== -1 && !pointOnCircle) {
        setEnteredZones(zones => zones.filter(z => z !== zone._id));
      }
      if (!pointOnCircle) zoneflag += 1;
    });

    if (zoneflag === zones.length) setEnteredZones([]);
    
    tunnels.forEach(tunnel => {
      const foundTunnel = passedTunnels.find(t => t._id === tunnel._id);
      const startPoint = [Number(tunnel.startLng), Number(tunnel.startLat)];
      const endPoint = [Number(tunnel.endLng), Number(tunnel.endLat)];
      const position = [Number(location.longitude), Number(location.latitude)];

      const tolerance = 0.0621371;
      const isFirstPointMatch = haversineDistance(startPoint, position) < tolerance;
      const isSecondPointMatch = haversineDistance(endPoint, position) < tolerance
;
      const pointInRoute = pointOnRoute(position, tunnel.coordinates, tolerance);

      if (foundTunnel !== undefined) {
        if (isFirstPointMatch && !(foundTunnel.fromStart)) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));

          credits += tunnel.credits;
        } else if (isSecondPointMatch && foundTunnel.fromStart) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));

          credits += tunnel.credits;
        } else if (!pointInRoute) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));
        }
      } else {
        if (isFirstPointMatch) {
          setPassedTunnels(prev => [...prev, {_id: tunnel._id, fromStart: true}])
        } else if (isSecondPointMatch) {
          setPassedTunnels(prev => [...prev, {_id: tunnel._id, fromStart: false}])
        }
      }
      if (!pointInRoute) tunnelflag += 1;
    })
    if (tunnels.length === tunnelflag) setPassedTunnels([]);

    if (credits > 0) updateCredits(credits);

  }, [location]);

  return [[location?.longitude, location?.latitude], enteredZones];
};