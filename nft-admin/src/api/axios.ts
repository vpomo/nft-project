import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import router from '@/router';

// Create a new Axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
        
        // Set Content-Type to application/json only if it's not FormData
        if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const authStore = useAuthStore();

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await authStore.refresh();
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                await authStore.logout();
                router.push('/login');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
