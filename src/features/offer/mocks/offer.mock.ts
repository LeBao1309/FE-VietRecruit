import type { Offer, CreateOfferDTO, UpdateOfferStatusDTO } from '../types/offer.schema';

// Mock initial state
let mockOffers: Offer[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    candidateId: 'c-1001',
    hrId: 'hr-1',
    salary: '120M VND + 10% KPI Bonus',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    fileLink: 'https://docs.google.com/document/d/1mockoffer',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c23e80a0-9c1d-4d8e-b5c6-8f2e1a3b4c5d',
    candidateId: 'c-1002',
    hrId: 'hr-1',
    salary: '200M VND/year',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    fileLink: 'https://docs.google.com/document/d/2mockoffer',
    status: 'SENT',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
      hrId: 'hr-1', // Mocked currently logged in HR
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
    };
    
    mockOffers[offerIndex] = updatedOffer;
    
    // Simulate side effect: Candidate status updates to HIRED
    if (data.status === 'ACCEPTED') {
      console.log(`[MOCK DB] Candidate ${existing.candidateId} status updated to HIRED`);
    }

    return updatedOffer;
  },
  
  // Expiration Cron Mock Check
  async expireOldOffers(): Promise<void> {
    const now = new Date();
    mockOffers = mockOffers.map(offer => {
      if (offer.status === 'SENT') {
        const sentDate = new Date(offer.updatedAt);
        const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 3600 * 24);
        if (daysDiff > 7) {
          return { ...offer, status: 'EXPIRED', updatedAt: now.toISOString() };
        }
      }
      return offer;
    });
  }
};
