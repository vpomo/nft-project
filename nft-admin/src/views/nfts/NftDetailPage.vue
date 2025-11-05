<template>
  <v-container>
    <v-btn to="/nfts" prepend-icon="mdi-arrow-left" class="mb-4">Back to List</v-btn>
    <v-card v-if="nft" :loading="nftStore.loading">
      <div class="d-flex justify-center mb-4">
        <v-img 
          :src="nft.image" 
          max-height="500px" 
          max-width="100%"
          class="mx-auto cursor-pointer rounded-lg elevation-2"
          contain
          @click="openImageDialog"
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular color="primary" indeterminate></v-progress-circular>
              <span class="ml-2 text-grey">Loading image...</span>
            </div>
          </template>
          <template v-slot:error>
            <div class="d-flex flex-column align-center justify-center fill-height bg-grey-lighten-2">
              <v-icon size="50" color="grey">mdi-image-off</v-icon>
              <p class="text-grey mt-2">Cannot load image from IPFS Gateway</p>
              <v-btn 
                variant="outlined" 
                size="small" 
                :href="nft.image" 
                target="_blank" 
                class="mt-2"
              >
                Open in new tab
              </v-btn>
            </div>
          </template>
        </v-img>
      </div>
      <v-card-title>{{ nft.name }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ nft.description }}</p>
        <v-divider></v-divider>
        <v-list>
          <v-list-item>
            <v-list-item-title>CIDv0</v-list-item-title>
            <v-list-item-subtitle>{{ nft.cid_v0 }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>CIDv1</v-list-item-title>
            <v-list-item-subtitle>{{ nft.cid_v1 }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>IPFS Gateway Link</v-list-item-title>
            <v-list-item-subtitle>
              <a :href="nft.ipfs_image_link" target="_blank">{{ nft.ipfs_image_link }}</a>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <v-alert v-if="nftStore.error" type="error">{{ nftStore.error }}</v-alert>
    <div v-if="!nft && nftStore.loading" class="text-center pa-5">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Image preview dialog -->
    <v-dialog v-model="imageDialog" max-width="90vw" max-height="90vh">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ nft?.name }} - Full Size</span>
          <v-btn icon="mdi-close" variant="text" @click="imageDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img 
            :src="nft?.image" 
            max-height="80vh"
            contain
            class="mx-auto"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
                <span class="ml-2">Loading full size image...</span>
              </div>
            </template>
          </v-img>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn 
            :href="nft?.image" 
            target="_blank" 
            variant="outlined"
            prepend-icon="mdi-open-in-new"
          >
            Open in new tab
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useNftStore } from '@/stores/nft.store';
import { storeToRefs } from 'pinia';

const route = useRoute();
const nftStore = useNftStore();
const { currentNft: nft } = storeToRefs(nftStore);

// Dialog state for image preview
const imageDialog = ref(false);

// Function to open image in dialog
const openImageDialog = () => {
  imageDialog.value = true;
};

onMounted(() => {
  const nftId = route.params.id as string;
  nftStore.fetchNftById(nftId);
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}
</style>
