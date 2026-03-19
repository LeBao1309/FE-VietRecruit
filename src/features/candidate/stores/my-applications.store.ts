import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  ApplicationSummaryResponse, 
  ApplicationResponse, 
  ApplicationStatusHistoryResponse,
  InterviewResponse,
  OfferResponse
} from '../types/application.schema'

export const useMyApplicationsStore = defineStore('myApplications', () => {
  const applications = ref<ApplicationSummaryResponse[]>([])
  const selectedApplication = ref<ApplicationResponse | null>(null)
  const statusHistory = ref<ApplicationStatusHistoryResponse[]>([])
  const interviews = ref<InterviewResponse[]>([])
  const offers = ref<OfferResponse[]>([])
  
  const page = ref(0)
  const size = ref(10)
  const totalElements = ref(0)
  const totalPages = ref(0)
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    applications,
    selectedApplication,
    statusHistory,
    interviews,
    offers,
    page,
    size,
    totalElements,
    totalPages,
    isLoading,
    error,
  }
})
