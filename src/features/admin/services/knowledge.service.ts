// src/features/admin/services/knowledge.service.ts
// AI RAG knowledge document management — upload, list, delete, reprocess.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type { KnowledgeDocument } from '../types/admin.dto'

const BASE = '/vietrecruit/ai/knowledge'

export const knowledgeService = {
  async upload(file: File): Promise<KnowledgeDocument> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<ApiResponse<KnowledgeDocument>>(
      `${BASE}/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data
  },

  async list(): Promise<KnowledgeDocument[]> {
    const { data } = await apiClient.get<ApiResponse<KnowledgeDocument[]>>(BASE)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`)
  },

  async reprocess(id: string): Promise<KnowledgeDocument> {
    const { data } = await apiClient.post<ApiResponse<KnowledgeDocument>>(
      `${BASE}/${id}/reprocess`,
    )
    return data.data
  },
}
