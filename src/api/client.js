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
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      const inner = body.data;
      if (inner && typeof inner === 'object' && !Array.isArray(inner) && body.message) {
        response.data = { ...inner, message: inner.message || body.message };
      } else if (inner === null || inner === undefined) {
        response.data = { message: body.message };
      } else {
        response.data = inner;
      }
    }
    return response;
  },
  (error) => {
    const resData = error?.response?.data;
    const serverMessage =
      resData?.message ||
      resData?.error?.message ||
      error?.message ||
      'Unexpected server error';
    const enrichedError = new Error(serverMessage);
    enrichedError.status = error?.response?.status || resData?.error?.code;
    enrichedError.details = resData?.error?.details || null;
    enrichedError.data = resData;
    return Promise.reject(enrichedError);
  }
);

export default apiClient;