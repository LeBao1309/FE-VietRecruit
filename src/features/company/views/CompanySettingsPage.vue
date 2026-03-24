<script setup lang="ts">
import { ref } from 'vue'
import SettingsProfileTab from '../components/SettingsProfileTab.vue'
import DepartmentsTab from '../components/DepartmentsTab.vue'
import LocationsTab from '../components/LocationsTab.vue'
import CategoriesTab from '../components/CategoriesTab.vue'
import TeamManagementTab from '../components/TeamManagementTab.vue'

// --- Tabs Configuration ---
const currentTab = ref('profile')
const tabs = [
  { id: 'profile', name: 'Hồ sơ Công ty' },
  { id: 'departments', name: 'Phòng ban' },
  { id: 'locations', name: 'Địa điểm' },
  { id: 'categories', name: 'Danh mục' },
  { id: 'team', name: 'Thành viên' },
]

// --- Mock Data & State (for UI demonstration) ---
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// 1. Profile Data
const companyData = ref({
  name: 'VietRecruit Corp',
  domain: 'Công nghệ & Tuyển dụng',
  website: 'https://vietrecruit.vn',
})

// 2. Departments Data
const departments = ref([
  { id: '1', name: 'Kỹ thuật', description: 'Phát triển sản phẩm và vận hành hệ thống' },
  { id: '2', name: 'Kinh doanh', description: 'Phát triển thị trường và chăm sóc khách hàng' },
  { id: '3', name: 'Nhân sự', description: 'Quản lý con người và văn hóa công ty' },
])

// 3. Locations Data
const locations = ref([
  { id: '1', name: 'Văn phòng chính (HCM)', address: '123 Nguyễn Huệ, Quận 1, TP. HCM' },
  { id: '2', name: 'Chi nhánh Hà Nội', address: '456 Lê Duẩn, Quận Hoàn Kiếm, Hà Nội' },
])

// 4. Categories Data
const categories = ref([
  { id: '1', name: 'Công nghệ thông tin' },
  { id: '2', name: 'Marketing' },
  { id: '3', name: 'Sales' },
  { id: '4', name: 'Design' },
])

// 5. Team Data
const members = ref([
  { id: '1', userId: 'u1', email: 'admin@vietrecruit.vn', fullName: 'Nguyễn Quản Trị', role: 'COMPANY_ADMIN' as const, joinedAt: '2023-01-01' },
  { id: '2', userId: 'u2', email: 'hr_manager@vietrecruit.vn', fullName: 'Trần Tuyển Dụng', role: 'HR' as const, joinedAt: '2023-05-15' },
  { id: '3', userId: 'u3', email: 'interviewer_1@vietrecruit.vn', fullName: 'Lê Phỏng Vấn', role: 'INTERVIEWER' as const, joinedAt: '2023-08-20' },
])

const invitations = ref([
  { id: 'inv1', email: 'candidate_specialist@gmail.com', role: 'HR' as const, invitedAt: '2024-03-20', expiresAt: '2024-03-27' },
])

// --- Event Handlers (Simulated) ---
const clearMessages = () => {
  error.value = null
  successMessage.value = null
}

const handleProfileSave = async (payload: any) => {
  clearMessages()
  isSaving.value = true
  setTimeout(() => {
    companyData.value = { ...payload }
    isSaving.value = false
    successMessage.value = 'Cập nhật thông tin công ty thành công.'
  }, 1000)
}

const handleDeptCreate = (payload: any) => {
  const newDept = { id: Date.now().toString(), ...payload }
  departments.value.push(newDept)
}

const handleDeptUpdate = (id: string, payload: any) => {
  const index = departments.value.findIndex(d => d.id === id)
  if (index !== -1) departments.value[index] = { ...departments.value[index], ...payload }
}

const handleDeptDelete = (id: string) => {
  departments.value = departments.value.filter(d => d.id !== id)
}

const handleLocCreate = (payload: any) => {
  const newLoc = { id: Date.now().toString(), ...payload }
  locations.value.push(newLoc)
}

const handleLocUpdate = (id: string, payload: any) => {
  const index = locations.value.findIndex(l => l.id === id)
  if (index !== -1) locations.value[index] = { ...locations.value[index], ...payload }
}

const handleLocDelete = (id: string) => {
  locations.value = locations.value.filter(l => l.id !== id)
}

const handleCatCreate = (payload: any) => {
  const newCat = { id: Date.now().toString(), ...payload }
  categories.value.push(newCat)
}

const handleCatUpdate = (id: string, payload: any) => {
  const index = categories.value.findIndex(c => c.id === id)
  if (index !== -1) categories.value[index] = { ...categories.value[index], ...payload }
}

const handleCatDelete = (id: string) => {
  categories.value = categories.value.filter(c => c.id !== id)
}

const handleInvite = (payload: any) => {
  clearMessages()
  isSaving.value = true
  setTimeout(() => {
    invitations.value.push({
      id: Date.now().toString(),
      email: payload.email,
      role: payload.role,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    isSaving.value = false
    successMessage.value = `Đã gửi lời mời tới ${payload.email}`
  }, 1000)
}

const handleUpdateRole = (memberId: string, role: any) => {
  const member = members.value.find(m => m.id === memberId)
  if (member) member.role = role
}

const handleRemoveMember = (memberId: string) => {
  members.value = members.value.filter(m => m.id !== memberId)
}

const handleRevokeInvitation = (invitationId: string) => {
  invitations.value = invitations.value.filter(i => i.id !== invitationId)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Cài đặt Công ty</h1>
        <p class="mt-2 text-gray-600">Quản lý hồ sơ doanh nghiệp, cấu trúc tổ chức và đội ngũ nhân sự của bạn.</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id; clearMessages()"
            :class="[
              currentTab === tab.id
                ? 'border-[#009898] text-[#009898]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="transition-all duration-300">
        <SettingsProfileTab
          v-if="currentTab === 'profile'"
          :company="companyData"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :error="error"
          :successMessage="successMessage"
          @save="handleProfileSave"
        />

        <DepartmentsTab
          v-else-if="currentTab === 'departments'"
          :departments="departments"
          :page="0"
          :totalPages="1"
          :totalElements="departments.length"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :error="error"
          @create="handleDeptCreate"
          @update="handleDeptUpdate"
          @delete="handleDeptDelete"
          @pageChange="() => {}"
        />

        <LocationsTab
          v-else-if="currentTab === 'locations'"
          :locations="locations"
          :page="0"
          :totalPages="1"
          :totalElements="locations.length"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :error="error"
          @create="handleLocCreate"
          @update="handleLocUpdate"
          @delete="handleLocDelete"
          @pageChange="() => {}"
        />

        <CategoriesTab
          v-else-if="currentTab === 'categories'"
          :categories="categories"
          :page="0"
          :totalPages="1"
          :totalElements="categories.length"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :error="error"
          @create="handleCatCreate"
          @update="handleCatUpdate"
          @delete="handleCatDelete"
          @pageChange="() => {}"
        />

        <TeamManagementTab
          v-else-if="currentTab === 'team'"
          :members="members"
          :invitations="invitations"
          :isLoading="isLoading"
          :isSaving="isSaving"
          :error="error"
          :successMessage="successMessage"
          :currentUserRole="'COMPANY_ADMIN'"
          @invite="handleInvite"
          @updateRole="handleUpdateRole"
          @removeMember="handleRemoveMember"
          @revokeInvitation="handleRevokeInvitation"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
