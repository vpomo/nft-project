<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list-item
          prepend-icon="mdi-account"
          :title="authStore.user?.phone || 'User'"
          nav
      ></v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-image-multiple" title="NFTs" to="/nfts"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Users" to="/users"></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2" v-if="authStore.isAuthenticated">
          <v-btn block color="red" @click="handleLogout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>NFT Admin Panel</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const drawer = ref(true);
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};

onMounted(() => {
  // Fetch user details if not already present
  if (!authStore.user) {
    authStore.fetchUser();
  }
});
</script>
