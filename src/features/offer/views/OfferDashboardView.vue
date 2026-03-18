<!-- src/features/offer/views/OfferDashboardView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { applicationService } from '../services/application.service';
import type { ApplicationSummary } from '../types/application.schema';
import { useOfferStore } from '../stores/offer.store';
import OfferStatusBadge from '../components/OfferStatusBadge.vue';
import { Loader2, Plus, Eye, Send, CheckCircle, FileX, XCircle, Users } from 'lucide-vue-next';

const router = useRouter();
const offerStore = useOfferStore();

const applications = ref<ApplicationSummary[]>([]);
const loadingApps = ref(false);
const errorApps = ref<string | null>(null);

const selectedAppIdForOffers = ref<string | null>(null);

onMounted(async () => {
  await fetchApplications();
});

const fetchApplications = async () => {
  loadingApps.value = true;
  errorApps.value = null;
  selectedAppIdForOffers.value = null;
  try {
    // Fetch apps (can optionally pass { status: 'OFFER' } if preferred)
    const res = await applicationService.getApplications();
    applications.value = res.content;
  } catch (err: any) {
    errorApps.value = err.response?.data?.message || err.message || 'Failed to fetch applications';
  } finally {
    loadingApps.value = false;
  }
};

const viewOffersForApplication = async (appId: string) => {
  if (selectedAppIdForOffers.value === appId) {
    // toggle close
    selectedAppIdForOffers.value = null;
    return;
  }
  selectedAppIdForOffers.value = appId;
  await offerStore.fetchOffers(appId);
};

const draftOffer = (appId: string) => {
  router.push(`/offers/create?applicationId=${appId}`);
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Offer Management</h1>
          <p class="text-slate-500 mt-2 text-lg">Manage job offers across all active candidate applications.</p>
        </div>
      </div>

      <!-- Apps State Handling -->
      <div v-if="loadingApps && applications.length === 0" class="flex flex-col items-center justify-center py-20 text-blue-600">
        <Loader2 class="animate-spin mb-4" :size="40" />
        <p class="text-slate-600 font-medium animate-pulse">Loading candidate pipelines...</p>
      </div>
      
      <div v-else-if="errorApps" class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-red-100 rounded-full">
            <XCircle :size="20" class="text-red-600" />
          </div>
          <span class="font-medium">{{ errorApps }}</span>
        </div>
        <button @click="fetchApplications" class="text-sm font-semibold underline text-red-700 hover:text-red-900">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="applications.length === 0" class="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5 text-blue-600">
          <Users :size="24" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900 mb-2">No active applications found</h3>
        <p class="text-slate-500 max-w-sm mb-6">Candidates applying to jobs will appear here for offer consideration.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th class="px-6 py-4">Candidate</th>
                <th class="px-6 py-4">Job Role</th>
                <th class="px-6 py-4">Pipeline Status</th>
                <th class="px-6 py-4">Applied Date</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="app in applications" :key="app.id">
                <tr class="hover:bg-slate-50 transition-colors group" :class="{ 'bg-blue-50/30': selectedAppIdForOffers === app.id }">
                  <td class="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {{ app.candidateName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="block">{{ app.candidateName }}</div>
                      <div class="text-xs text-slate-400 font-mono font-normal">...{{ app.id.slice(-8) }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-800">{{ app.jobTitle }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                      {{ app.status.toLowerCase() }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    {{ new Date(app.createdAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        @click="viewOffersForApplication(app.id)"
                        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border shadow-sm border-slate-200 bg-white"
                      >
                        <Eye :size="14" /> {{ selectedAppIdForOffers === app.id ? 'Hide Offers' : 'View Offers' }}
                      </button>
                      <button 
                        @click="draftOffer(app.id)"
                        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors shadow-sm"
                      >
                        <Plus :size="14" /> Draft Offer
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded View: Embedded Offers List for selected Application -->
                <tr v-if="selectedAppIdForOffers === app.id">
                  <td colspan="5" class="p-0 border-b border-blue-100 bg-blue-50">
                    <div class="p-6 pl-14">
                      <h4 class="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                        Sent & Drafted Offers for {{ app.candidateName }}
                        <Loader2 v-if="offerStore.loading" class="animate-spin text-blue-600" :size="16" />
                      </h4>
                      
                      <div v-if="!offerStore.loading && offerStore.error" class="text-red-500 text-sm mb-4">{{ offerStore.error }}</div>
                      
                      <div v-else-if="!offerStore.loading && offerStore.offers.length === 0" class="text-sm text-slate-500 italic bg-white p-4 rounded-lg border border-slate-200 text-center">
                        No offers have been created for this application yet.
                      </div>

                      <div v-else-if="!offerStore.loading" class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <table class="w-full text-sm text-left">
                          <thead class="bg-slate-50 text-slate-500 text-xs border-b">
                            <tr>
                              <th class="px-4 py-3">Base Salary</th>
                              <th class="px-4 py-3">Start Date</th>
                              <th class="px-4 py-3">Status</th>
                              <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            <tr v-for="offer in offerStore.offers" :key="offer.id" class="hover:bg-slate-50">
                              <td class="px-4 py-3 font-semibold text-slate-800">
                                {{ formatCurrency(offer.baseSalary, offer.currency) }}
                              </td>
                              <td class="px-4 py-3 text-slate-600">
                                {{ new Date(offer.startDate).toLocaleDateString() }}
                              </td>
                              <td class="px-4 py-3">
                                <OfferStatusBadge :status="offer.status" />
                              </td>
                              <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-2">
                                  <button v-if="offer.status === 'DRAFT'" @click="offerStore.sendOffer(offer.id)" title="Send to Candidate" class="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Send :size="14" /></button>
                                  <template v-if="offer.status === 'SENT'">
                                    <button @click="offerStore.respondToOffer(offer.id, 'ACCEPTED', 'Simulated Accept')" title="Candidate Accept" class="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded"><CheckCircle :size="14" /></button>
                                    <button @click="offerStore.respondToOffer(offer.id, 'DECLINED', 'Simulated Decline')" title="Candidate Decline" class="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"><FileX :size="14" /></button>
                                  </template>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
