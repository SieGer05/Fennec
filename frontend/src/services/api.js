import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  // Base URL of your backend API
  // Change this to the server IP/domain when deploying (e.g., "https://api.mydomain.com")
  baseURL: 'http://localhost:8000',

  // Request timeout in milliseconds
  timeout: 30000,

  // Default headers sent with every request
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
    
    // Decide if a toast should be shown (default: true)
    // To disable for a request: api.get("/endpoint", { showToast: false })
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