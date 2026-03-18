<!-- src/features/offer/views/OfferCreateView.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useOfferStore } from '../stores/offer.store';
import OfferForm from '../components/OfferForm.vue';
import type { CreateOfferDTO } from '../types/offer.schema';
import { ArrowLeft } from 'lucide-vue-next';
import { onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const offerStore = useOfferStore();

const applicationId = route.query.applicationId as string;

onMounted(() => {
  if (!applicationId) {
    alert("Application ID is missing. Returning to dashboard.");
    router.push('/offers');
  }
});

const handleCreate = async (data: CreateOfferDTO) => {
  if (!applicationId) return;
  try {
    await offerStore.createOffer(applicationId, data);
    router.push('/offers');
  } catch (error) {
    console.error('Failed to create offer:', error);
  }
};

const handleCancel = () => {
  router.push('/offers');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="handleCancel" 
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 focus:outline-none"
        >
          <ArrowLeft :size="16" /> Back to Application List
        </button>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Create New Offer</h1>
        <p class="text-slate-500 mt-2 text-lg">
          Draft an offer letter for the selected application.
          <span v-if="applicationId" class="block text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2 max-w-fit font-mono">
            Application ID: {{ applicationId }}
          </span>
        </p>
      </div>

      <!-- Main Form -->
      <OfferForm @submit="handleCreate" @cancel="handleCancel" />
    </div>
  </div>
</template>
