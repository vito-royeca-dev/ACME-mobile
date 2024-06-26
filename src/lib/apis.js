import { Alert, Platform } from "react-native";
import Axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ANDROID_CKIENT_ID, BACKEND_URL, IOS_CLIENT_ID, MAP_PK_TOKEN, WEB_CLIENT_ID } from "../constants";
import { getUserId } from "../utils/auth";

const instance = Axios.create({
    baseURL: BACKEND_URL,
})

export const updateLocation = async (location, distance) => {
  try {
    const userId = await getUserId();
    await instance.post('/api/users/update-distance-location', {
      userId,
      location,
      distance,
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

export const getRoute = async (startCoords, endCoords, alternative=false) => {
  if (!startCoords || !endCoords) {
    return [];
  }
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/
    ${String(startCoords[0])},${String(startCoords[1])};
    ${String(endCoords[0])},${String(endCoords[1])}
    ?geometries=geojson&alternatives=${alternative}&access_token=${MAP_PK_TOKEN}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.routes;
  } catch (error) {
    console.log('Error fetching route:', error);
    return [];
  }
};