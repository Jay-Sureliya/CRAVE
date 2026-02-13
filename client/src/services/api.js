import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// 🔐 Attach token automatically to EVERY request
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Check if the error is a 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      
      // 2. CHECK: Is this error coming from the login request itself?
      // We check if the request URL includes '/login'
      const isLoginRequest = error.config.url.includes('/login');

      // 3. Only trigger the logout/reload if it is NOT a login request
      if (!isLoginRequest) {
        sessionStorage.clear();
        // window.location.reload(); // Or redirect to auth
        window.location.href = '/auth';
      }
    }
    
    // 4. Always reject the error so your AuthPage catch block receives it
    return Promise.reject(error);
  }
);

export default api;