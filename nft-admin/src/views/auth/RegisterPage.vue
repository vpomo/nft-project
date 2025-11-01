<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4" elevation="5">
          <v-card-title class="text-center text-h5">Register</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" dense class="mb-4">
              Registration successful! You can now log in.
            </v-alert>
            <v-form @submit.prevent="handleRegister">
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
              <v-text-field
                  v-model="code"
                  label="Registration Code"
                  prepend-inner-icon="mdi-key"
                  required
                  hint="Provided by administrator (e.g., 98765)"
              ></v-text-field>
              <v-btn type="submit" color="primary" block :loading="authStore.isLoading">
                Register
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <router-link to="/auth/login">Already have an account? Login</router-link>
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
const code = ref('98765'); // Pre-fill based on API docs
const error = ref<string | null>(null);
const success = ref(false);

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  error.value = null;
  success.value = false;
  try {
    await authStore.register({ phone: phone.value, password: password.value, code: code.value });
    success.value = true;
    setTimeout(() => router.push('/auth/login'), 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed. Please check your data.';
  }
};
</script>
