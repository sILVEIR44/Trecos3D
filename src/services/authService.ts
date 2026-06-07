import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.1.33:3000',
});

// Antes de cada requisição, pega o token salvo e coloca no header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@Trecos3D:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
