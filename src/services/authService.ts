import axios from 'axios';
const api = axios.create({
  baseURL: 'http://192.168.1.33:3000', // Coloca seu ip aqui
});

export default api;