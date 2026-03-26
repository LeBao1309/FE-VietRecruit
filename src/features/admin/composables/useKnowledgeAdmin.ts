// src/features/admin/composables/useKnowledgeAdmin.ts
// Data layer for AI RAG knowledge document management in the admin panel.

import { ref } from 'vue'
import { knowledgeService } from '../services/knowledge.service'
import type { KnowledgeDocument } from '../types/admin.dto'
import { parseApiError } from '@/core/utils/error.utils'

export function useKnowledgeAdmin() {
  const documents = ref<KnowledgeDocument[]>([])
  const isLoading = ref(false)
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      documents.value = await knowledgeService.list()
    } catch (e) {
      error.value = parseApiError(e)
    } finally {
      isLoading.value = false
    }
  }

  async function upload(file: File): Promise<boolean> {
    isUploading.value = true
    error.value = null
    try {
      const doc = await knowledgeService.upload(file)
      documents.value.unshift(doc)
      return true
    } catch (e) {
      error.value = parseApiError(e)
      return false
    } finally {
      isUploading.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    error.value = null
    try {
      await knowledgeService.delete(id)
      documents.value = documents.value.filter((d) => d.id !== id)
      return true
    } catch (e) {
      error.value = parseApiError(e)
      return false
    }
  }

  async function reprocess(id: string): Promise<boolean> {
    error.value = null
    try {
      const updated = await knowledgeService.reprocess(id)
      const idx = documents.value.findIndex((d) => d.id === id)
      if (idx !== -1) documents.value[idx] = updated
      return true
    } catch (e) {
      error.value = parseApiError(e)
      return false
    }
  }

  return { documents, isLoading, isUploading, error, fetchDocuments, upload, remove, reprocess }
}
