<script setup lang="ts">
// src/features/candidate/components/JobSearchBar.vue
// Enhanced search bar with debounced autocomplete and faceted filters.

import { ref, watch } from 'vue'
import { Search, MapPin, Briefcase, Loader2, X } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  categories: Array<{ id: string; name: string }>
  locations: Array<{ id: string; name: string }>
  suggestions: string[]
  isSearching: boolean
}>()

const emit = defineEmits<{
  search: [params: { keyword?: string; categoryId?: string; locationId?: string }]
  autocomplete: [query: string]
}>()

const keyword = ref('')
const categoryId = ref('')
const locationId = ref('')
const showSuggestions = ref(false)

const debouncedAutocomplete = useDebounceFn((query: string) => {
  if (query.length >= 2) {
    emit('autocomplete', query)
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}, 300)

watch(keyword, (newVal) => {
  debouncedAutocomplete(newVal)
})

const handleSearch = () => {
  showSuggestions.value = false
  emit('search', {
    keyword: keyword.value || undefined,
    categoryId: categoryId.value || undefined,
    locationId: locationId.value || undefined
  })
}

const selectSuggestion = (s: string) => {
  keyword.value = s
  showSuggestions.value = false
  handleSearch()
}

const clearSearch = () => {
  keyword.value = ''
  showSuggestions.value = false
}
</script>

<template>
  <div class="relative w-full max-w-5xl mx-auto">
    <div class="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-stretch gap-2 transition-all focus-within:ring-2 focus-within:ring-[#009898]/20">
      
      <!-- Keyword Input -->
      <div class="flex-1 relative flex items-center group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-gray-400 group-focus-within:text-[#009898] transition-colors" />
        </div>
        <input 
          v-model="keyword"
          @focus="showSuggestions = keyword.length >= 2"
          @keydown.enter="handleSearch"
          type="text" 
          class="block w-full pl-11 pr-10 py-4 text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 text-base font-medium"
          placeholder="Tên công việc, kỹ năng, hoặc công ty..."
        />
        <button v-if="keyword" @click="clearSearch" class="absolute right-2 p-2 text-gray-400 hover:text-gray-600">
          <X class="w-4 h-4" />
        </button>

        <!-- Autocomplete Dropdown -->
        <div v-if="showSuggestions && suggestions.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div class="py-2">
            <button 
              v-for="s in suggestions" 
              :key="s"
              @click="selectSuggestion(s)"
              class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Search class="w-4 h-4 text-gray-300" />
              <span class="text-sm font-medium text-gray-700">{{ s }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="hidden md:block w-px h-10 bg-gray-100 self-center mx-1"></div>

      <!-- Category Select -->
      <div class="w-full md:w-56 relative flex items-center">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Briefcase class="h-5 w-5 text-gray-400" />
        </div>
        <select 
          v-model="categoryId"
          class="block w-full pl-11 pr-10 py-4 text-gray-700 bg-transparent border-none focus:ring-0 text-sm font-medium appearance-none cursor-pointer"
        >
          <option value="">Tất cả ngành nghề</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div class="absolute right-4 pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <!-- Divider -->
      <div class="hidden md:block w-px h-10 bg-gray-100 self-center mx-1"></div>

      <!-- Location Select -->
      <div class="w-full md:w-56 relative flex items-center">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin class="h-5 w-5 text-gray-400" />
        </div>
        <select 
          v-model="locationId"
          class="block w-full pl-11 pr-10 py-4 text-gray-700 bg-transparent border-none focus:ring-0 text-sm font-medium appearance-none cursor-pointer"
        >
          <option value="">Toàn quốc</option>
          <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <div class="absolute right-4 pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <!-- Search Button -->
      <button 
        @click="handleSearch"
        :disabled="isSearching"
        class="w-full md:w-auto px-10 py-4 bg-[#009898] text-white rounded-xl font-bold shadow-lg shadow-[#009898]/20 hover:bg-[#007a7a] hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <Loader2 v-if="isSearching" class="w-5 h-5 animate-spin" />
        <span v-else>Tìm kiếm</span>
      </button>
    </div>
  </div>
</template>
