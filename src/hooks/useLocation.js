import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { requestPermissions } from '../utils/mapbox';

export const useLocation = () => {
  const [location, setLocation] = useState({latitude: 40.32, longitude: 90.34});

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
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting current position:', error);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
       
        },
        (error) => {
          console.error('Error watching position:', error);
        },
        { enableHighAccuracy: true, distanceFilter: 0, interval: 5000 }
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    };

    getLocation();
  }, []);

  return [location?.longitude, location?.latitude];
};
