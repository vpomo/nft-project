<template>
  <v-container>
    <v-card>
      <v-card-title>Create New NFT</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
              v-model.number="formData.id"
              label="Token ID"
              type="number"
              required
              class="mb-4"
          ></v-text-field>
          <v-textarea
              v-model="formData.description"
              label="Description"
              required
              class="mb-4"
          ></v-textarea>


          <label for="file-upload" class="v-label">Image File</label>
          <input type="file" id="file-upload" ref="fileInput" @change="handleFileChange" required class="mt-2" />
          <div v-if="selectedFileName" class="mt-2 text-grey">Selected: {{ selectedFileName }}</div>

          <v-btn type="submit" color="primary" class="mt-8" :loading="nftStore.loading">
            Create NFT
          </v-btn>
          <v-btn to="/nfts" class="mt-8 ml-2">Cancel</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useNftStore } from '@/stores/nft.store';
import { useRouter } from 'vue-router';

const nftStore = useNftStore();
const router = useRouter();

const formData = reactive({
  id: null as number | null,
  description: '',
});

// --- ИЗМЕНЕНИЯ В SCRIPT ---
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const selectedFileName = ref('');
const error = ref<string | null>(null);

const handleFileChange = () => {
  if (fileInput.value?.files && fileInput.value.files.length > 0) {
    selectedFile.value = fileInput.value.files[0];
    selectedFileName.value = selectedFile.value.name;
  } else {
    selectedFile.value = null;
    selectedFileName.value = '';
  }
};

const handleSubmit = async () => {
  error.value = null;

  // Обновленная валидация
  if (formData.id === null || formData.id === undefined || !formData.description.trim() || !selectedFile.value) {
    error.value = 'All fields are required.';
    return;
  }

  try {
    // Передаем сырые данные, включая файл
    await nftStore.createNft({
      id: formData.id!,
      description: formData.description,
      file: selectedFile.value!
    });
    router.push('/nfts');
  } catch (err) {
    error.value = nftStore.error;
  }
};
</script>

<style scoped>
/* Добавим немного стилей для инпута */
input[type="file"] {
  display: block;
  border: 1px solid #9E9E9E;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}
</style>
