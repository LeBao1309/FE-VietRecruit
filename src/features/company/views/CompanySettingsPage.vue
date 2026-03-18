<script setup lang="ts">
import { ref } from 'vue'
import SettingsProfileTab from '../components/SettingsProfileTab.vue'
import DepartmentsTab from '../components/DepartmentsTab.vue'
import LocationsTab from '../components/LocationsTab.vue'
import CategoriesTab from '../components/CategoriesTab.vue'
import TeamManagementTab from '../components/TeamManagementTab.vue'

const currentTab = ref('profile')
const tabs = [
  { id: 'profile', name: 'Hồ sơ Công ty' },
  { id: 'departments', name: 'Phòng ban' },
  { id: 'locations', name: 'Địa điểm' },
  { id: 'categories', name: 'Danh mục' },
  { id: 'team', name: 'Thành viên' },
]
</script>

<template>
  <div class="min-h-screen bg-surface-soft px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="font-display text-2xl font-bold text-text-primary mb-1">
        Cài đặt Tổ chức
      </h1>
      <p class="text-text-secondary text-sm mb-6">
        Quản lý thông tin và cấu trúc tổ chức của công ty.
      </p>

      <!-- Tabs Navigation -->
      <div class="flex space-x-6 border-b border-surface-muted mb-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="pb-3 text-sm font-semibold transition-colors whitespace-nowrap"
          :class="currentTab === tab.id ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-text-secondary hover:text-text-primary'"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div v-if="currentTab === 'profile'">
        <SettingsProfileTab />
      </div>
      <div v-else-if="currentTab === 'departments'">
        <DepartmentsTab />
      </div>
      <div v-else-if="currentTab === 'locations'">
        <LocationsTab />
      </div>
      <div v-else-if="currentTab === 'categories'">
        <CategoriesTab />
      </div>
      <div v-else-if="currentTab === 'team'">
        <TeamManagementTab />
      </div>
    </div>
  </div>
</template>
