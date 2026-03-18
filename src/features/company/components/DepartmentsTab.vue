<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrgStore } from '@/core/stores/org.store'
import { DepartmentRequestSchema } from '@/features/company/types/org.dto'

const store = useOrgStore()

onMounted(() => {
  store.fetchDepartments(0)
})

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref('')
const name = ref('')
const description = ref('')
const fieldErrors = ref<{ name?: string }>({})

function openCreate() {
  isEdit.value = false
  currentId.value = ''
  name.value = ''
  description.value = ''
  fieldErrors.value = {}
  store.clearError()
  showModal.value = true
}

function openEdit(dept: any) {
  isEdit.value = true
  currentId.value = dept.id
  name.value = dept.name
  description.value = dept.description || ''
  fieldErrors.value = {}
  store.clearError()
  showModal.value = true
}

async function handleSave() {
  const result = DepartmentRequestSchema.safeParse({
    name: name.value,
    description: description.value || undefined
  })
  
  if (!result.success) {
    const errs: any = {}
    for (const issue of result.error.issues) {
       if (issue.path[0]) {
         errs[String(issue.path[0])] = issue.message
       }
    }
    fieldErrors.value = errs
    return
  }
  
  fieldErrors.value = {}
  let ok = false
  if (isEdit.value) {
    ok = await store.updateDepartment(currentId.value, result.data)
  } else {
    ok = await store.createDepartment(result.data)
  }
  
  if (ok) {
    showModal.value = false
  }
}

async function handleDelete(id: string) {
  if (confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
    await store.deleteDepartment(id)
  }
}

function nextPage() {
  if (store.deptPage < store.deptTotalPages - 1) {
    store.fetchDepartments(store.deptPage + 1)
  }
}

function prevPage() {
  if (store.deptPage > 0) {
    store.fetchDepartments(store.deptPage - 1)
  }
}
</script>

<template>
  <div class="card space-y-4">
    <div v-if="store.error" class="p-3 rounded-lg bg-danger/10 text-danger text-sm">
      {{ store.error }}
    </div>
    
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-text-primary">Phòng ban</h2>
      <button class="btn-primary px-4 py-2 text-sm" @click="openCreate" :disabled="store.isLoading || store.isSaving || store.isDeleting">
        Add
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border border-surface-muted rounded-lg">
      <table class="w-full text-left text-sm text-text-secondary">
        <thead class="bg-surface-soft text-text-primary border-b border-surface-muted">
          <tr>
            <th class="px-4 py-3 font-medium">Tên phòng ban</th>
            <th class="px-4 py-3 font-medium">Mô tả</th>
            <th class="px-4 py-3 font-medium text-right">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-muted">
          <tr v-if="store.isLoading" class="animate-pulse">
            <td colspan="3" class="px-4 py-4 text-center">Đang tải...</td>
          </tr>
          <tr v-else-if="store.departments.length === 0">
            <td colspan="3" class="px-4 py-4 text-center">Không có dữ liệu</td>
          </tr>
          <tr v-else v-for="dept in store.departments" :key="dept.id" class="hover:bg-surface-soft/50">
            <td class="px-4 py-3">{{ dept.name }}</td>
            <td class="px-4 py-3">{{ dept.description || '-' }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <button 
                class="text-brand-primary hover:underline text-sm font-medium mr-2" 
                @click="openEdit(dept)"
                :disabled="store.isLoading || store.isSaving || store.isDeleting"
              >
                Edit
              </button>
              <button 
                class="text-danger hover:underline text-sm font-medium" 
                @click="handleDelete(dept.id)"
                :disabled="store.isLoading || store.isSaving || store.isDeleting"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between pt-4">
      <div class="text-sm text-text-secondary">
        Page {{ store.deptTotalPages > 0 ? store.deptPage + 1 : 0 }} / {{ store.deptTotalPages }} (Tổng: {{ store.deptTotalElements }})
      </div>
      <div class="space-x-2 flex">
        <button 
          class="px-3 py-1.5 border border-surface-muted rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-soft transition-colors"
          @click="prevPage" 
          :disabled="store.deptPage === 0 || store.isLoading"
        >
          Prev
        </button>
        <button 
          class="px-3 py-1.5 border border-surface-muted rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-soft transition-colors"
          @click="nextPage" 
          :disabled="store.deptPage >= store.deptTotalPages - 1 || store.isLoading"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <div class="bg-surface-base w-full max-w-md rounded-xl p-6 shadow-xl mx-4 my-8">
        <h3 class="text-lg font-semibold text-text-primary mb-4">{{ isEdit ? 'Sửa Phòng ban' : 'Thêm Phòng ban' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Tên phòng ban <span class="text-danger">*</span>
            </label>
            <input v-model="name" type="text" class="input" :class="{'!border-danger': fieldErrors.name}" maxlength="255" />
            <p v-if="fieldErrors.name" class="text-danger text-xs mt-1.5">{{ fieldErrors.name }}</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Mô tả
            </label>
            <textarea v-model="description" class="input w-full min-h-[80px]" rows="3"></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button class="px-4 py-2 text-sm text-text-secondary hover:text-text-primary" @click="showModal = false" :disabled="store.isSaving">
            Cancel
          </button>
          <button class="btn-primary px-4 py-2 text-sm" @click="handleSave" :disabled="store.isSaving">
            <span v-if="store.isSaving">Đang lưu...</span>
            <span v-else>Save</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
