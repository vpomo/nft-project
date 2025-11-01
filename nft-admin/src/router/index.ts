import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: AdminLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/dashboard/DashboardPage.vue'),
                },
                {
                    path: 'nfts',
                    name: 'nft-list',
                    component: () => import('@/views/nfts/NftListPage.vue'),
                },
                {
                    path: 'nfts/create',
                    name: 'nft-create',
                    component: () => import('@/views/nfts/CreateNftPage.vue'),
                },
                {
                    path: 'nfts/:id',
                    name: 'nft-detail',
                    component: () => import('@/views/nfts/NftDetailPage.vue'),
                },
                {
                    path: 'users',
                    name: 'user-list',
                    component: () => import('@/views/users/UserListPage.vue'),
                }
            ],
        },
        {
            path: '/auth',
            component: AuthLayout,
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/views/auth/LoginPage.vue'),
                },
                {
                    path: 'register',
                    name: 'register',
                    component: () => import('@/views/auth/RegisterPage.vue'),
                }
            ],
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/NotFound.vue')
        }
    ],
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // If accessing a protected route without authentication
    if (requiresAuth && !authStore.isAuthenticated) {
        console.log('Redirecting to login - no authentication');
        next({ name: 'login' });
    } 
    // If accessing login/register while authenticated
    else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
        console.log('Redirecting to dashboard - already authenticated');
        next({ name: 'dashboard' });
    } 
    // Otherwise, allow navigation
    else {
        next();
    }
});


export default router
