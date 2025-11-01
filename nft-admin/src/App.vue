<template>
  <v-app>
    <ConfirmDialog />
    <RouterView />
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from "@/stores/auth.store";
import { onMounted } from "vue";

const authStore = useAuthStore();

onMounted(async () => {
  // Check if we have tokens in localStorage
  if (authStore.accessToken || authStore.refreshToken) {
    // If we have tokens, try to refresh to validate them
    if (authStore.refreshToken) {
      try {
        await authStore.refresh();
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Initial token refresh failed, clearing auth state.", error);
        // If refresh fails, clear all auth data
        authStore.clearAuthState();
      }
    } else {
      // If we have access token but no refresh token, clear everything
      console.log("No refresh token found, clearing auth state.");
      authStore.clearAuthState();
    }
  }
});
</script>
