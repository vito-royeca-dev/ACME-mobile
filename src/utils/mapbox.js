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