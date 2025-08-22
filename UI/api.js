import axios from 'axios';
//cliente del backend (mazos)
export const API_BASE =
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) ||
  'http://localhost:8000';

//cliente del backend para el servidor del modelo
export const BACKEND_URL =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  'http://localhost:5678';


export const api = axios.create({
  baseURL: API_BASE,
  timeout: 0,
  responseType: 'json',
});

export const lms = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120000,
  responseType: 'json',

});

// ---------- Interceptors API ----------
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    console.error('API Request Error:', error?.message || error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.statusText, response.config?.url);
    return response;
  },
  (error) => {
    const { response } = error || {};
    const status = response?.status;
    const url = response?.config?.url || '';

    const isAuthRoute = url.includes('/auth/log-in') || url.includes('/auth/sign-up');
    const isClientError = status >= 400 && status < 500;

    if (isAuthRoute && isClientError) {
      console.warn('Auth client error', status, url)}
      else if(response){
          console.error(
        'API Response Error:',
        status,
        response.statusText,
        url,
        '\nBody:', response.data
      );

      } else {
      console.error('API Network Error:', error?.code, error?.message);
    }
    return Promise.reject(error);
  }
);

// interceptores del modelo (lms)
lms.interceptors.request.use((config) => {
  console.log('LMS Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
  return config;
});

lms.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response } = error || {};
    if (response) {
      console.error(
        'LMS Error:',
        response.status,
        response.statusText,
        response.config?.url,
        '\nBody:', response.data
      );
    } else {
      console.error('LMS Network/Error:', error?.code, error?.message, error?.config?.url);
    }
    return Promise.reject(error);
  }
);




export default api;
