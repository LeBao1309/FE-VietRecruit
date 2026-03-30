import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OfferStatus } from '@/types/enums'
import type { OfferCreateRequest, OfferResponse } from '@/types/application'
import { offerService } from '@/services/offerService'
import { useUiStore } from './uiStore'

export const useOfferStore = defineStore('offer', () => {
  // ── State ──────────────────────────────────────────────────────────
  const offers = ref<OfferResponse[]>([])
  const currentOffer = ref<OfferResponse | null>(null)

  const listLoading = ref(false)
  const detailLoading = ref(false)
  const createLoading = ref(false)
  const sendLoading = ref(false)
  const respondLoading = ref(false)
  const deleteLoading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────
  const isDraft = computed(() => currentOffer.value?.status === 'DRAFT')
  const isSent = computed(() => currentOffer.value?.status === 'SENT')
  const isAccepted = computed(() => currentOffer.value?.status === 'ACCEPTED')
  const isDeclined = computed(() => currentOffer.value?.status === 'DECLINED')

  /** DRAFT → can send or delete; SENT → waiting for candidate */
  const canSend = computed(() => isDraft.value)
  const canDelete = computed(() => isDraft.value)
  const canRespond = computed(() => isSent.value)

  // ── Actions ────────────────────────────────────────────────────────

  /** List all offers for an application */
  async function fetchOffers(applicationId: string): Promise<void> {
    listLoading.value = true
    try {
      const result = await offerService.listOffers(applicationId)
      if (result.data) {
        offers.value = result.data
      } else {
        const ui = useUiStore()
        ui.toastError('Failed to load offers', result.error?.message)
        offers.value = []
      }
    } finally {
      listLoading.value = false
    }
  }

  /** Get a single offer */
  async function fetchOffer(id: string): Promise<boolean> {
    detailLoading.value = true
    try {
      const result = await offerService.getOffer(id)
      if (result.data) {
        currentOffer.value = result.data
        return true
      }
      const ui = useUiStore()
      ui.toastError('Offer not found', result.error?.message)
      return false
    } finally {
      detailLoading.value = false
    }
  }

  /** Create a DRAFT offer for an application */
  async function createOffer(
    applicationId: string,
    body: OfferCreateRequest,
  ): Promise<OfferResponse | null> {
    const ui = useUiStore()
    createLoading.value = true
    try {
      const result = await offerService.createOffer(applicationId, body)
      if (result.data) {
        offers.value.unshift(result.data)
        ui.toastSuccess('Offer created', 'A draft offer has been created.')
        return result.data
      }
      ui.toastError('Failed to create offer', result.error?.message)
      return null
    } finally {
      createLoading.value = false
    }
  }

  /** Send the offer to the candidate (DRAFT → SENT) */
  async function sendOffer(id: string): Promise<boolean> {
    const ui = useUiStore()
    sendLoading.value = true
    try {
      const result = await offerService.sendOffer(id)
      if (result.data) {
        currentOffer.value = result.data
        _updateInList(id, result.data)
        ui.toastSuccess('Offer sent', 'The offer has been sent to the candidate.')
        return true
      }
      ui.toastError('Failed to send offer', result.error?.message)
      return false
    } finally {
      sendLoading.value = false
    }
  }

  /** Candidate responds to an offer (ACCEPT / DECLINE) */
  async function respondToOffer(
    id: string,
    action: 'ACCEPT' | 'DECLINE',
  ): Promise<boolean> {
    const ui = useUiStore()
    respondLoading.value = true
    try {
      const result = await offerService.respondToOffer(id, { action })
      if (result.data) {
        currentOffer.value = result.data
        _updateInList(id, result.data)
        const label = action === 'ACCEPT' ? 'accepted' : 'declined'
        ui.toastSuccess(`Offer ${label}`, `You have ${label} the offer.`)
        return true
      }
      ui.toastError('Response failed', result.error?.message)
      return false
    } finally {
      respondLoading.value = false
    }
  }

  /** Delete a DRAFT offer */
  async function deleteOffer(id: string): Promise<boolean> {
    const ui = useUiStore()
    deleteLoading.value = true
    try {
      const result = await offerService.deleteOffer(id)
      if (!result.error) {
        offers.value = offers.value.filter((o) => o.id !== id)
        if (currentOffer.value?.id === id) currentOffer.value = null
        ui.toastSuccess('Offer deleted', 'The draft offer has been removed.')
        return true
      }
      ui.toastError('Failed to delete', result.error.message)
      return false
    } finally {
      deleteLoading.value = false
    }
  }

  /** Clear detail state */
  function clearCurrent(): void {
    currentOffer.value = null
  }

  // ── Internal helpers ──
  function _updateInList(id: string, updated: OfferResponse): void {
    const idx = offers.value.findIndex((o) => o.id === id)
    if (idx !== -1) offers.value[idx] = updated
  }

  return {
    // state
    offers,
    currentOffer,
    listLoading,
    detailLoading,
    createLoading,
    sendLoading,
    respondLoading,
    deleteLoading,
    // getters
    isDraft,
    isSent,
    isAccepted,
    isDeclined,
    canSend,
    canDelete,
    canRespond,
    // actions
    fetchOffers,
    fetchOffer,
    createOffer,
    sendOffer,
    respondToOffer,
    deleteOffer,
    clearCurrent,
  }
})
