import { defineStore } from 'pinia';
import { ref } from 'vue';
import { offerService } from '../services/offer.service';
import type { Offer, CreateOfferDTO } from '../types/offer.schema';

export const useOfferStore = defineStore('offer', () => {
  const offers = ref<Offer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // We fetch by application ID. We'll store it here if we want to retain context.
  const currentApplicationId = ref<string | null>(null);

  async function fetchOffers(applicationId: string) {
    loading.value = true;
    error.value = null;
    currentApplicationId.value = applicationId;
    try {
      offers.value = await offerService.getOffersByApplication(applicationId);
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch offers';
    } finally {
      loading.value = false;
    }
  }

  async function createOffer(applicationId: string, data: CreateOfferDTO) {
    loading.value = true;
    error.value = null;
    try {
      const newOffer = await offerService.createOffer(applicationId, data);
      offers.value.push(newOffer);
      return newOffer;
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to create offer';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function sendOffer(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await offerService.sendOffer(id);
      const index = offers.value.findIndex(o => o.id === id);
      if (index !== -1) {
        offers.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to send offer';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function respondToOffer(id: string, status: "ACCEPTED" | "DECLINED", note?: string) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await offerService.respondToOffer(id, status, note);
      const index = offers.value.findIndex(o => o.id === id);
      if (index !== -1) {
        offers.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to respond to offer';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    offers,
    loading,
    error,
    currentApplicationId,
    fetchOffers,
    createOffer,
    sendOffer,
    respondToOffer,
  };
});
