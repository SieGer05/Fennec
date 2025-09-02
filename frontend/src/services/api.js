import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    const res = error.response;
    const errorMessage = res?.data?.detail || 
                        res?.data?.message || 
                        res?.statusText || 
                        'An unexpected error occurred';
    
    const showToast = error.config?.showToast !== false;
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return Promise.reject({
      message: errorMessage,
      status: res?.status,
      data: res?.data
    });
  }
);

export default api;