// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000",
//   withCredentials: true,
// });

// // 🔐 Attach token automatically to EVERY request
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       sessionStorage.clear();
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// --- 1. REQUEST INTERCEPTOR (Attach Token) ---
api.interceptors.request.use(
  (config) => {
    // Check both Local Storage and Session Storage
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      // Remove any extra quotes that might have been saved by JSON.stringify
      token = token.replace(/^"|"$/g, '');

      // Attach the token to the header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. RESPONSE INTERCEPTOR (Handle Errors) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired (401 Unauthorized)
    if (error.response?.status === 401) {
      console.warn("Session expired or invalid token.");

      // Clear all storage to prevent loop
      sessionStorage.clear();
      localStorage.clear();

      // Redirect to login only if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;