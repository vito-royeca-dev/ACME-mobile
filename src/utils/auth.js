import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserId = async () => {
  const id = await AsyncStorage.getItem('user');
  return id;
}
