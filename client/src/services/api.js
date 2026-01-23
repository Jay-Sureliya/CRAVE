import axios from 'axios';

// 1. Create the instance
const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// 2. Add the interceptor (to attach token automatically)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. EXPORT IT (This is the line you are likely missing!)
export default api;