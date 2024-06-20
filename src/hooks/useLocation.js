import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { requestPermissions } from '../utils/mapbox';
Geolocation.setRNConfiguration({skipPermissionRequests: true});

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
          console.log("first user position is :", position.coords);
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        err => {
          console.log(err);
        },
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          console.log("user is moving!!!!");
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        err => {
          console.log(err);
        },
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    };

    getLocation();
  }, []);

  useEffect(() => {
    
  }, [location]);

  return [location?.longitude, location?.latitude];
};
