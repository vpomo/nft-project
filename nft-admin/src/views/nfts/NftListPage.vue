<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        NFTs
        <v-spacer></v-spacer>
        <v-btn color="primary" to="/nfts/create">Create NFT image</v-btn>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="nftStore.nfts"
          :loading="nftStore.loading"
          class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" :to="`/nfts/${item.token_id}`"></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNftStore } from '@/stores/nft.store';

const nftStore = useNftStore();

const headers = [
  { title: 'Token ID', key: 'token_id', align: 'start' },
  { title: 'Description', key: 'description' },
  { title: 'CIDv1', key: 'cid_v1' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

onMounted(() => {
  nftStore.fetchAllNfts();
});
</script>
