import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = '@Trecos3D:userToken';

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(AUTH_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(AUTH_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_KEY);
};