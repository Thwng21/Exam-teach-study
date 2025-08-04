import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: any) => {
    console.log('API Error interceptor:', error?.response?.status, error?.response?.data?.message);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    const enhancedError = new Error(message);
    // Preserve original response for debugging
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

export { api };

// Generic API call function
export const apiCall = async (endpoint: string, data?: any, options?: any) => {
  try {
    let response;
    if (data && options?.method !== 'GET') {
      // For POST, PUT, PATCH with data
      const method = options?.method || 'POST';
      response = await api.request({
        method,
        url: endpoint,
        data,
        ...options
      });
    } else {
      // For GET requests
      response = await api.get(endpoint, options);
    }
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};
