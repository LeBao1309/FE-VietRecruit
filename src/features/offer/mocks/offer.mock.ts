import type { Offer, CreateOfferDTO, UpdateOfferStatusDTO } from '../types/offer.schema';

// Mock initial state
let mockOffers: Offer[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    applicationId: 'app-1001',
    baseSalary: 120000000,
    currency: 'VND',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    offerLetterUrl: 'https://docs.google.com/document/d/1mockoffer',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c23e80a0-9c1d-4d8e-b5c6-8f2e1a3b4c5d',
    applicationId: 'app-1002',
    baseSalary: 200000000,
    currency: 'VND',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    offerLetterUrl: 'https://docs.google.com/document/d/2mockoffer',
    status: 'SENT',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const offerApiMock = {
  async getOffers(): Promise<Offer[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockOffers];
  },

  async createOffer(data: CreateOfferDTO): Promise<Offer> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newOffer: Offer = {
      ...data,
      id: crypto.randomUUID(),
      applicationId: crypto.randomUUID(), // Mocking applicationId since it isn't in DTO
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
    mockOffers.push(newOffer);
    return newOffer;
  },

  async updateOfferStatus(id: string, data: UpdateOfferStatusDTO): Promise<Offer> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const offerIndex = mockOffers.findIndex((o) => o.id === id);
    if (offerIndex === -1) throw new Error('Offer not found');
    
    // Create a new offer object ensuring all fields conform to Offer
    const existing = mockOffers[offerIndex] as Offer;
    const updatedOffer: Offer = {
      ...existing,
      status: data.status,
    };
    
    mockOffers[offerIndex] = updatedOffer;
    
    // Simulate side effect: Candidate status updates to HIRED
    if (data.status === 'ACCEPTED') {
      console.log(`[MOCK DB] Application ${existing.applicationId} status updated to HIRED`);
    }

    return updatedOffer;
  },
  
  // Expiration Cron Mock Check
  async expireOldOffers(): Promise<void> {
    const now = new Date();
    mockOffers = mockOffers.map(offer => {
      if (offer.status === 'SENT') {
        const sentDate = new Date(offer.createdAt);
        const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 3600 * 24);
        if (daysDiff > 7) {
          return { ...offer, status: 'EXPIRED' };
        }
      }
      return offer;
    });
  }
};
