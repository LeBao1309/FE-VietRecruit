<script setup lang="ts">
import { ref } from 'vue'

interface Category {
  id: string
  name: string
}

defineProps<{
  categories: Category[]
  page: number
  totalPages: number
  totalElements: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
}>()

const emit = defineEmits<{
  create: [payload: { name: string }]
  update: [id: string, payload: { name: string }]
  delete: [id: string]
  pageChange: [page: number]
}>()

const isModalOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const currentCategory = ref<Category | null>(null)
const formData = ref({
  name: '',
})

const openModal = (cat?: Category) => {
  if (cat) {
    currentCategory.value = cat
    formData.value = {
      name: cat.name,
    }
  } else {
    currentCategory.value = null
    formData.value = {
      name: '',
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  currentCategory.value = null
}

const handleSubmit = () => {
  if (currentCategory.value) {
    emit('update', currentCategory.value.id, { ...formData.value })
  } else {
    emit('create', { ...formData.value })
  }
  closeModal()
}

const openDeleteConfirm = (cat: Category) => {
  currentCategory.value = cat
  isDeleteConfirmOpen.value = true
}

const confirmDelete = () => {
  if (currentCategory.value) {
    emit('delete', currentCategory.value.id)
    isDeleteConfirmOpen.value = false
    currentCategory.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold text-gray-800">Danh mục công việc</h3>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-[#009898] hover:bg-[#007a7a] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm danh mục
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên danh mục</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="isLoading" v-for="i in 3" :key="i" class="animate-pulse">
              <td class="px-6 py-4"><div class="h-4 bg-gray-100 rounded w-1/2"></div></td>
              <td class="px-6 py-4 text-right"><div class="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="2" class="px-6 py-10 text-center text-gray-500 italic">
                Chưa có danh mục nào được tạo.
              </td>
            </tr>
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ cat.name }}</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openModal(cat)"
                  class="p-2 text-gray-400 hover:text-[#009898] transition-colors"
                  title="Chỉnh sửa"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="openDeleteConfirm(cat)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Trang {{ page + 1 }} / {{ totalPages }} (Tổng: {{ totalElements }})
        </div>
        <div class="flex space-x-2">
          <button
            :disabled="page === 0"
            @click="emit('pageChange', page - 1)"
            class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            :disabled="page >= totalPages - 1"
            @click="emit('pageChange', page + 1)"
            class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h4 class="text-lg font-bold text-gray-800">
            {{ currentCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới' }}
          </h4>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Tên danh mục <span class="text-red-500">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none"
              placeholder="Ví dụ: Công nghệ, Kinh doanh, Marketing..."
            />
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 font-semibold hover:text-gray-800">Hủy</button>
          <button
            @click="handleSubmit"
            :disabled="!formData.name || isSaving"
            class="px-6 py-2 bg-[#009898] hover:bg-[#007a7a] text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {{ isSaving ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="isDeleteConfirmOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h4>
        <p class="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa danh mục <strong>{{ currentCategory?.name }}</strong>? Hành động này không thể hoàn tác.
        </p>
        <div class="flex gap-3">
          <button @click="isDeleteConfirmOpen = false" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
          <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>
