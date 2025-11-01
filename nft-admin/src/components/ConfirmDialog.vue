<template>
  <v-dialog v-model="dialog" max-width="450" persistent>
    <v-card :title="title" :text="message">
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="onCancel" :disabled="loading">Cancel</v-btn>
        <v-btn @click="onConfirm" :color="color" :loading="loading">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm';

const { onConfirm, onCancel, dialog, title, message, color, loading } = useConfirm();
</script>
