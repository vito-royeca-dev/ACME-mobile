import { Alert, Platform } from "react-native";
import Axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { MAP_PK_TOKEN } from "../constants";

const instance = Axios.create({
    baseURL: 'http://localhost:5000',
})

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
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();
    // Send ID token to server
    const idToken = userInfo.idToken;
    const platform = Platform.OS;

    const response = await fetch('http://localhost:5000/auth/google', {
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
    console.log(data);
    if (response.ok) {
      // Store user info and token
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
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
    }
  }
}

export const getRoute = async (startCoords, endCoords, alternative=false) => {
  if (!startCoords || !endCoords) {
    return [];
  }
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${String(startCoords[0])},${String(startCoords[1])};${String(endCoords[0])},${String(endCoords[1])}?geometries=geojson&alternatives=${alternative}&access_token=${MAP_PK_TOKEN}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.routes;
  } catch (error) {
    console.log('Error fetching route:', error);
    return [];
  }
};
