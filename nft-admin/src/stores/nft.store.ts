import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import type { NftInfo } from '@/types';

export const useNftStore = defineStore('nft', {
    state: () => ({
        nfts: [] as NftInfo[],
        currentNft: null as NftInfo | null,
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchAllNfts(limit: number = 50000) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.get(`/api/nft/all/${limit}`);
                this.nfts = response.data.infos || [];
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch NFTs';
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async fetchNftById(id: number | string) {
            this.loading = true;
            this.currentNft = null;
            this.error = null;
            try {
                const response = await apiClient.get(`/api/nft/${id}`);
                this.currentNft = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || `Failed to fetch NFT with id ${id}`;
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async createNft(data: { id: number; description: string; file: File }) {
            this.loading = true;
            this.error = null;
            try {
                // Создаем FormData здесь, прямо перед отправкой
                const formData = new FormData();
                formData.append('id', String(data.id));
                formData.append('description', data.description);
                formData.append('file', data.file);

                // Отладочные логи
                console.log('Sending NFT data:', {
                    id: data.id,
                    description: data.description,
                    fileName: data.file.name,
                    fileSize: data.file.size
                });
                
                // Проверяем содержимое FormData
                for (let [key, value] of formData.entries()) {
                    console.log(`FormData ${key}:`, value);
                }

                await apiClient.post('/api/nft_data', formData);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to create NFT';
                console.error('NFT creation error:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
