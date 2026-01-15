import axios from 'axios';

// Same API base as web frontend; change if needed
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api';
// 10.0.2.2 works for Android emulator to reach localhost on your PC

const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

export default httpClient;
