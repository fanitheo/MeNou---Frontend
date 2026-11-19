import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 12000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unexpected server error';
    const enrichedError = new Error(serverMessage);
    enrichedError.status = error?.response?.status;
    enrichedError.data = error?.response?.data;
    return Promise.reject(enrichedError);
  }
);

export default apiClient;