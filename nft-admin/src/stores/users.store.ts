import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import type { User, UsersListResponse } from '@/types';

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [] as User[],
        total: 0,
        loading: false,
        error: null as string | null,
        currentPage: 1,
        itemsPerPage: 20,
    }),
    actions: {
        async fetchUsers(page: number = 1, limit: number = 20) {
            this.loading = true;
            this.error = null;
            try {
                const offset = (page - 1) * limit;
                const response = await apiClient.get<UsersListResponse>(`/auth/users/?limit=${limit}&offset=${offset}`);
                
                this.users = response.data.users;
                this.total = response.data.total;
                this.currentPage = page;
                this.itemsPerPage = limit;
                
                console.log('Fetched users:', response.data);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch users';
                console.error('Error fetching users:', err);
            } finally {
                this.loading = false;
            }
        },

        async changeUserRole(userId: number, role: string) {
            this.loading = true;
            this.error = null;
            try {
                await apiClient.post('/auth/change_role', { user_id: userId, role });
                // Update the local state
                const user = this.users.find(u => u.user_id === userId);
                if (user) {
                    user.role = role;
                }
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to change role';
                console.error('Error changing user role:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteUser(userId: number) {
            this.loading = true;
            this.error = null;
            try {
                await apiClient.post('/auth/delete_user', { user_id: userId });
                // Update the local state
                this.users = this.users.filter(u => u.user_id !== userId);
                this.total = Math.max(0, this.total - 1);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to delete user';
                console.error('Error deleting user:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
