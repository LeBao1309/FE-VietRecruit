<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý tri thức AI</h1>
        <p class="text-gray-500 mt-1 text-sm">Tải lên và quản lý các tài liệu để làm giàu kho tri thức cho AI (RAG).</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div 
      class="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center transition-all duration-200 hover:border-[#009898] group relative"
      :class="{ 'opacity-50 pointer-events-none': isUploading }"
    >
      <input 
        type="file" 
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".pdf,.docx,.txt"
        @change="handleFileChange"
      />
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
          <svg v-if="!isUploading" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <svg v-else class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">{{ isUploading ? 'Đang tải lên...' : 'Kéo thả hoặc nhấn để tải lên tài liệu' }}</h3>
        <p class="text-gray-500 mt-2 text-sm">Hỗ trợ định dạng PDF, DOCX, TXT. Tối đa 20MB.</p>
      </div>
    </div>
    
    <div class="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
      <!-- Loading State -->
      <div v-if="isLoading" class="divide-y divide-gray-100">
        <div v-for="i in 3" :key="i" class="p-6 animate-pulse flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div class="h-4 w-1/6 bg-gray-200 rounded"></div>
          </div>
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center text-red-500">
        <p class="font-medium">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="documents.length === 0" class="p-20 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-4">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Chưa có tài liệu tri thức nào. Tải lên tài liệu để AI có thể sử dụng.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên tài liệu</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kích thước</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Chunks</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tải</th>
              <th scope="col" class="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="text-sm font-bold text-gray-900 truncate max-w-xs">{{ doc.filename }}</div>
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span class="text-xs font-bold text-gray-500 uppercase">{{ doc.contentType.split('/')[1] || doc.contentType }}</span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                {{ formatSize(doc.fileSize) }}
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="flex items-center">
                  <template v-if="doc.status === 'PROCESSING'">
                    <svg class="animate-spin h-4 w-4 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Đang xử lý</span>
                  </template>
                  <template v-else-if="doc.status === 'INDEXED'">
                    <svg class="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Đã lập chỉ mục</span>
                  </template>
                  <template v-else>
                    <svg class="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span class="text-xs font-bold text-red-600 uppercase tracking-wider">Lỗi</span>
                  </template>
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-bold">
                {{ doc.chunkCount || 0 }}
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                {{ formatDate(doc.uploadedAt) }}
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-right text-sm">
                <div class="flex items-center justify-end space-x-3">
                  <button 
                    v-if="doc.status === 'FAILED'"
                    @click="$emit('reprocess', doc.id)"
                    class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Thử lại"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button 
                    @click="handleDelete(doc)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa tài liệu"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KnowledgeDocument {
  id: string
  filename: string
  contentType: string
  fileSize: number
  status: 'PROCESSING' | 'INDEXED' | 'FAILED'
  uploadedAt: string
  chunkCount?: number
}

const props = defineProps<{
  documents: KnowledgeDocument[]
  isLoading: boolean
  isUploading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  upload: [file: File]
  delete: [id: string]
  reprocess: [id: string]
}>()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('upload', target.files[0])
    target.value = '' // Reset input
  }
}

const handleDelete = (doc: KnowledgeDocument) => {
  if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.filename}"?`)) {
    emit('delete', doc.id)
  }
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
