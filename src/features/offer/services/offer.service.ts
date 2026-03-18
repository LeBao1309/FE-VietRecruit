import { apiClient } from '@/core/api/axios.instance';
import type { Offer, CreateOfferDTO } from '../types/offer.schema';

export const offerService = {
  async getOffersByApplication(applicationId: string): Promise<Offer[]> {
    const { data } = await apiClient.get(`/vietrecruit/applications/${applicationId}/offers`);
    return data.data; // Assuming ApiResponse<Offer[]> wrapper
  },
  
  async getOfferById(offerId: string): Promise<Offer> {
    const { data } = await apiClient.get(`/vietrecruit/offers/${offerId}`);
    return data.data;
  },

  async createOffer(applicationId: string, payload: CreateOfferDTO): Promise<Offer> {
    const { data } = await apiClient.post(`/vietrecruit/applications/${applicationId}/offers`, payload);
    return data.data;
  },
  
  async sendOffer(offerId: string): Promise<Offer> {
    const { data } = await apiClient.put(`/vietrecruit/offers/${offerId}/send`);
    return data.data;
  },

  async respondToOffer(offerId: string, status: "ACCEPTED" | "DECLINED", note?: string): Promise<Offer> {
    const { data } = await apiClient.put(`/vietrecruit/offers/${offerId}/respond`, { status, note });
    return data.data;
  }
};
