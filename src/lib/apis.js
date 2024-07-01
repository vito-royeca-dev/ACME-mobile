import { Alert, Platform } from "react-native";
import Axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import polyline from '@mapbox/polyline';

import { ANDROID_CKIENT_ID, BACKEND_URL, IOS_CLIENT_ID, MAP_PK_TOKEN, WEB_CLIENT_ID } from "../constants";
import { getUserId } from "../utils/auth";
import { formatDistance, formatDuration } from "../utils/mapbox";

const instance = Axios.create({
    baseURL: BACKEND_URL,
})

export const updateLocation = async (location, distance) => {
  try {
    const userId = await getUserId();
    const diff = distance ? distance : 0;
    
    await instance.post('/api/users/update-distance-location', {
      userId,
      location,
      distance: diff,
    });
  } catch (e) {
    console.error('Error updating location:', e);
  }
};

export const updateCredits = async (credits) => {
  try {
    const userId = await getUserId();
    await instance.post('/api/users/update-credits', {
      userId,
      credits,
    });
  } catch (e) {
    console.error('Error updating credits:', e);
  }
};

export const fetchTunnels = async () => {
  try {
    const response = await instance.get('/api/tunnels');
    return response.data;
  } catch (error) {
    console.error('Error fetching tunnels:', error);
    return [];
  }
};

export const fetchZones = async (callback) => {
  try {
    const response = await instance.get('/api/zones');
    callback(response.data);
  } catch (error) {
    console.error('Error fetching zones:', error);
    callback([]);
  }
};

export const fetchMessages = async (callback) => {
  try {
    const response = await instance.get('/api/messages');
    callback(response.data);
  } catch (error) {
    console.error('Error fetching zones:', error);
    callback([]);
  }
};

export const signIn = async (callback) => { 
  try {
    GoogleSignin.configure({
      androidClientId: ANDROID_CKIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
    });

    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();
    // Send ID token to server
    const idToken = userInfo.idToken;
    const platform = Platform.OS;
    const response = await fetch(`${BACKEND_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        platform,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      // Store user info and token
      await AsyncStorage.setItem('user', data.id);
      await AsyncStorage.setItem('token', data.token);
      Alert.alert('Sign-In Successful', `Welcome to the app! ${userInfo.user.givenName}!`);
      callback(); // Notify App component to re-check login status
    } else {
      Alert.alert('Sign-In Failed', data.message);
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled the login flow');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Sign in is in progress already');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Play services not available or outdated');
    } else {
      console.error('Some other error:', error);
      console.log(JSON.stringify(error));
    }
  }
}

export const getOneRoute = async (startCoords, endCoords) => {
  if (!startCoords || !endCoords) {
    return [];
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${String(startCoords[0])},${String(startCoords[1])};${String(endCoords[0])},${String(endCoords[1])}.json?geometries=polyline&overview=full&access_token=${MAP_PK_TOKEN}`;

  try {
    const res = await Axios.get(url);
    if (res.status === 200) {
      const routeIfo = res.data.routes[0];
      const coords = polyline.decode(routeIfo.geometry).map(p => [p[1], p[0]]);

      return coords
    } 
    
    return [];
  } catch (error) {
    console.log('Error fetching polyline:', error);
    return [];
  }
};


export const getTwoRoute = async (startCoords, endCoords) => {
  console.log("two reoutes");
  if (!startCoords || !endCoords) {
    return [];
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${String(startCoords[0])},${String(startCoords[1])};${String(endCoords[0])},${String(endCoords[1])}.json?geometries=polyline&alternatives=true&overview=full&access_token=${MAP_PK_TOKEN}`;

  try {
    const res = await Axios.get(url);
    if (res.status === 200) {
      const [routeIfo1, routeIfo2] = res.data.routes;
      
      const coords1 = polyline.decode(routeIfo1.geometry).map(p => [p[1], p[0]]);
      const distance1 = formatDistance(routeIfo1.distance);
      const duration1 = formatDuration(routeIfo1.duration);

      if (!routeIfo2) {
        return [{
          coords: coords1,
          distance: distance1,
          duration: duration1,
        }]
      }

      const coords2 = polyline.decode(routeIfo2.geometry).map(p => [p[1], p[0]]);
      const distance2 = formatDistance(routeIfo2.distance);
      const duration2 = formatDuration(routeIfo2.duration);
  
      return [
        {
          coords: coords1,
          distance: distance1,
          duration: duration1,
        },
        {
          coords: coords2,
          distance: distance2,
          duration: duration2,
        },
      ]
    } 
  } catch (error) {
    console.log('Error fetching polyline:', error);
    return [];
  }
};

export const fetchLocations = async (query, location) => {
  if (location?.length !== 2) return [];

  const url = `https://api.mapbox.com/search/searchbox/v1/forward?q=${query}&language=en&limit=5&proximity=${String(location[0])},${String(location[1])}&country=US&access_token=${MAP_PK_TOKEN}`
  try {
    const res = await Axios.get(url);

    if (res.status === 200) {
      const data = res.data.features.map(f => ({
        id: f.properties.mapbox_id,
        coordinates: f.geometry.coordinates,
        address: getFullAddress(f)
      }))
      return data;
    }
  } catch (error) {
    console.log('Error fetching polyline:', error);
    return [];
  }
}

const getFullAddress = (feature) => {
  const { address, street, neighborhood, postcode, place, region, country } = feature.properties.context;
  
  const addressNumber = address?.address_number || '';
  const streetName = street?.name || '';
  const neighborhoodName = neighborhood?.name || '';
  const postcodeName = postcode?.name || '';
  const placeName = place?.name || '';
  const regionName = region?.name || '';
  const countryName = country?.name || '';
  
  // Construct the full address
  const fullAddress = `${addressNumber} ${streetName} ${neighborhoodName} ${postcodeName} ${placeName} ${regionName} ${countryName}`;

  return fullAddress;
};