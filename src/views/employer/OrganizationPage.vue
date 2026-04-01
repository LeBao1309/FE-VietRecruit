<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { departmentService, locationService, categoryService } from '@/services/organizationService'
import type { DepartmentResponse } from '@/types/organization'
import type { LocationResponse } from '@/types/organization'
import type { CategoryResponse } from '@/types/organization'

const ui = useUiStore()

// ── Active tab ──
type Tab = 'departments' | 'locations' | 'categories'
const activeTab = ref<Tab>('departments')

// ── Data ──
const departments = ref<DepartmentResponse[]>([])
const locations = ref<LocationResponse[]>([])
const categories = ref<CategoryResponse[]>([])
const loading = ref(true)

// ── Modal ──
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalSaving = ref(false)
const editId = ref<string | null>(null)

const formName = ref('')
const formExtra = ref('') // description for dept, address for location
const formErrors = ref<Record<string, string>>({})

// ── Delete confirmation ──
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; name: string } | null>(null)
const deleting = ref(false)

// ── Load data ──
async function loadAll(): Promise<void> {
  loading.value = true
  try {
    const [depts, locs, cats] = await Promise.all([
      departmentService.list(),
      locationService.list(),
      categoryService.list(),
    ])
    if (depts.data) departments.value = depts.data.content
    if (locs.data) locations.value = locs.data.content
    if (cats.data) categories.value = cats.data.content
  } finally {
    loading.value = false
  }
}

// ── Modal helpers ──
function openCreate(): void {
  modalMode.value = 'create'
  editId.value = null
  formName.value = ''
  formExtra.value = ''
  formErrors.value = {}
  showModal.value = true
}

function openEdit(item: { id: string; name: string; description?: string | null; address?: string | null }): void {
  modalMode.value = 'edit'
  editId.value = item.id
  formName.value = item.name
  formExtra.value = (item.description ?? item.address) || ''
  formErrors.value = {}
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
}

function validate(): boolean {
  formErrors.value = {}
  if (!formName.value.trim()) {
    formErrors.value.name = 'Name is required.'
  } else if (formName.value.length > 255) {
    formErrors.value.name = 'Name must be 255 characters or fewer.'
  }
  return Object.keys(formErrors.value).length === 0
}

async function handleSave(): Promise<void> {
  if (!validate()) return
  modalSaving.value = true
  try {
    const tab = activeTab.value

    if (tab === 'departments') {
      const body = { name: formName.value.trim(), description: formExtra.value.trim() || undefined }
      const result = modalMode.value === 'create'
        ? await departmentService.create(body)
        : await departmentService.update(editId.value!, body)
      if (result.error) { ui.toastError('Error', result.error.message); return }
      ui.toastSuccess(modalMode.value === 'create' ? 'Department created' : 'Department updated')
    } else if (tab === 'locations') {
      const body = { name: formName.value.trim(), address: formExtra.value.trim() || undefined }
      const result = modalMode.value === 'create'
        ? await locationService.create(body)
        : await locationService.update(editId.value!, body)
      if (result.error) { ui.toastError('Error', result.error.message); return }
      ui.toastSuccess(modalMode.value === 'create' ? 'Location created' : 'Location updated')
    } else {
      const body = { name: formName.value.trim() }
      const result = modalMode.value === 'create'
        ? await categoryService.create(body)
        : await categoryService.update(editId.value!, body)
      if (result.error) { ui.toastError('Error', result.error.message); return }
      ui.toastSuccess(modalMode.value === 'create' ? 'Category created' : 'Category updated')
    }

    closeModal()
    await loadAll()
  } finally {
    modalSaving.value = false
  }
}

// ── Delete ──
function confirmDelete(item: { id: string; name: string }): void {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

async function handleDelete(): Promise<void> {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const tab = activeTab.value
    const id = deleteTarget.value.id

    const result = tab === 'departments'
      ? await departmentService.delete(id)
      : tab === 'locations'
        ? await locationService.delete(id)
        : await categoryService.delete(id)

    if (result.error) {
      ui.toastError('Delete failed', result.error.message)
      return
    }
    ui.toastSuccess('Deleted', `${deleteTarget.value.name} has been removed.`)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadAll()
  } finally {
    deleting.value = false
  }
}

const tabLabel: Record<Tab, string> = {
  departments: 'Department',
  locations: 'Location',
  categories: 'Category',
}

const extraLabel: Record<Tab, string | null> = {
  departments: 'Description',
  locations: 'Address',
  categories: null,
}

onMounted(loadAll)
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Organization</h1>
        <p class="text-sm text-gray-500 mt-1">Manage departments, locations, and job categories</p>
      </div>
      <button
        @click="openCreate"
        class="btn-primary"
      >
        <span class="text-lg leading-none">+</span> Add {{ tabLabel[activeTab] }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-border mb-6">
      <button
        v-for="tab in (['departments', 'locations', 'categories'] as Tab[])"
        :key="tab"
        @click="activeTab = tab"
        class="px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
        :class="activeTab === tab
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
      >
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
          :class="activeTab === tab ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-400'">
          {{ tab === 'departments' ? departments.length : tab === 'locations' ? locations.length : categories.length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="premium-card p-6 animate-pulse space-y-4">
      <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
    </div>

    <!-- Table -->
    <div v-else class="premium-card overflow-hidden">
      <!-- Departments -->
      <table v-if="activeTab === 'departments'" class="w-full">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Name</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Description</th>
            <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="departments.length === 0">
            <td colspan="3" class="text-center text-sm text-slate-400 py-16">
              No departments yet. Create your first one.
            </td>
          </tr>
          <tr v-for="dept in departments" :key="dept.id" class="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ dept.name }}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ dept.description ?? '—' }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit(dept)" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Edit</button>
              <button @click="confirmDelete(dept)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Locations -->
      <table v-if="activeTab === 'locations'" class="w-full">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Name</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Address</th>
            <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="locations.length === 0">
            <td colspan="3" class="text-center text-sm text-slate-400 py-16">
              No locations yet. Add your first office.
            </td>
          </tr>
          <tr v-for="loc in locations" :key="loc.id" class="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ loc.name }}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ loc.address ?? '—' }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit(loc)" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Edit</button>
              <button @click="confirmDelete(loc)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Categories -->
      <table v-if="activeTab === 'categories'" class="w-full">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Name</th>
            <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="categories.length === 0">
            <td colspan="2" class="text-center text-sm text-slate-400 py-16">
              No categories yet. Create your first job category.
            </td>
          </tr>
          <tr v-for="cat in categories" :key="cat.id" class="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ cat.name }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit({ id: cat.id, name: cat.name })" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Edit</button>
              <button @click="confirmDelete(cat)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="premium-modal-backdrop">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal" />
        <div class="premium-modal-content w-full max-w-md">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {{ modalMode === 'create' ? `Add ${tabLabel[activeTab]}` : `Edit ${tabLabel[activeTab]}` }}
          </h2>

          <form @submit.prevent="handleSave" class="space-y-5">
            <div>
              <label for="org-name" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name <span class="text-rose-500">*</span></label>
              <input
                id="org-name"
                v-model="formName"
                type="text"
                placeholder="Enter name"
                class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition"
                :class="formErrors.name ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
              />
              <p v-if="formErrors.name" class="text-xs text-rose-500 mt-1">{{ formErrors.name }}</p>
            </div>

            <div v-if="extraLabel[activeTab]">
              <label for="org-extra" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{{ extraLabel[activeTab] }}</label>
              <input
                id="org-extra"
                v-model="formExtra"
                type="text"
                :placeholder="`Enter ${extraLabel[activeTab]!.toLowerCase()}`"
                class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-2">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="modalSaving"
                class="btn-primary"
              >
                <span v-if="modalSaving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ modalSaving ? 'Saving…' : modalMode === 'create' ? 'Create' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="premium-modal-backdrop">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showDeleteConfirm = false" />
        <div class="premium-modal-content w-full max-w-sm text-center">
          <div class="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 text-3xl font-bold mx-auto mb-5 rotate-3 shadow-sm">
            ⚠
          </div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Delete {{ tabLabel[activeTab] }}?</h2>
          <p class="text-sm font-medium text-slate-500 mb-8">
            Are you sure you want to delete <span class="text-slate-700 dark:text-slate-300 font-bold">{{ deleteTarget?.name }}</span>?
            This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              :disabled="deleting"
              class="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
            >
              <span v-if="deleting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
