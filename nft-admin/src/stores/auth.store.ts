import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import type { LoginRequest, RegisterRequest, User } from '@/types';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || null as string | null,
        refreshToken: localStorage.getItem('refreshToken') || null as string | null,
        user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
        status: '', // 'loading', 'success', 'error'
    }),
    getters: {
        isAuthenticated: (state) => !!state.accessToken && !!state.refreshToken,
        isLoading: (state) => state.status === 'loading',
    },
    actions: {
        async login(credentials: LoginRequest) {
            this.status = 'loading';
            try {
                const { data } = await apiClient.post('/auth/login', credentials);
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;

                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);

                await this.fetchUser();

                this.status = 'success';
            } catch (error) {
                this.status = 'error';
                console.error('Login failed:', error);
                throw error;
            }
        },

        async register(userData: RegisterRequest) {
            this.status = 'loading';
            try {
                await apiClient.post('/auth/registration', userData);
                this.status = 'success';
            } catch (error) {
                this.status = 'error';
                console.error('Registration failed:', error);
                throw error;
            }
        },

        async logout() {
            this.status = 'loading';
            try {
                if (this.accessToken) {
                    await apiClient.post('/auth/logout');
                }
            } catch (error) {
                console.error("Logout API call failed, but proceeding with local cleanup:", error);
            } finally {
                this.accessToken = null;
                this.refreshToken = null;
                this.user = null;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                this.status = '';
                // The router push is handled in the interceptor or component
            }
        },

        async refresh() {
            this.status = 'loading';
            try {
                const { data } = await apiClient.post('/auth/refresh', { refresh_token: this.refreshToken });
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;

                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                this.status = 'success';
            } catch (error) {
                this.status = 'error';
                console.error('Token refresh failed:', error);
                // On failure, the interceptor will handle logout.
                throw error;
            }
        },

        async fetchUser() {
            // This is a placeholder. The Go backend doesn't have a /me endpoint.
            // We can decode the token or fetch user data upon login.
            // For now, we'll get info from the checkToken response in the interceptor,
            // but that's complex. A simpler way is to just store phone after login.
            // The checkToken response in the backend code gives us user data.
            // Let's assume we can get it from a new endpoint or after login.
            // For now, let's just create a dummy user object based on what we know.
            // A proper solution would be a GET /auth/me endpoint.
            if (this.user) return; // Already have user

            // A proper implementation would call an endpoint like GET /auth/me
            // Since it does not exist, we simulate it.
            // The `checkToken` function in Go has the user's phone and role.
            // Let's assume we get that info somehow after login.
            // For this example, we'll leave it simple.
        },

        // Clear invalid authentication state
        clearAuthState() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.status = '';
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },
});
