<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4" elevation="5">
          <v-card-title class="text-center text-h5">Login</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                  v-model="phone"
                  label="Phone"
                  prepend-inner-icon="mdi-phone"
                  required
              ></v-text-field>
              <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  prepend-inner-icon="mdi-lock"
                  required
              ></v-text-field>
              <v-btn type="submit" color="primary" block :loading="authStore.isLoading">
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <router-link to="/auth/register">Don't have an account? Register</router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const phone = ref('');
const password = ref('');
const error = ref<string | null>(null);

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  error.value = null;
  try {
    await authStore.login({ phone: phone.value, password: password.value });
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Invalid credentials or server error.';
  }
};
</script>
