<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const homeLink = computed(() => {
  if (route.path.startsWith('/employer')) return '/employer/dashboard'
  if (route.path.startsWith('/candidate')) return '/candidate/dashboard'
  if (route.path.startsWith('/admin')) return '/admin/users'
  return '/'
})

export interface BreadcrumbItem {
 name: string
 path?: string
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
 if (route.meta.breadcrumb) {
 return route.meta.breadcrumb as BreadcrumbItem[]
 }

 // Fallback: auto-generate from path
 const paths = route.path.split('/').filter(Boolean)
 const items: BreadcrumbItem[] = []

 let currentPath = ''
 for (const part of paths) {
 currentPath += `/${part}`
 // Basic humanizing
 const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
 items.push({ name, path: currentPath })
 }

 return items
})
</script>

<template>
 <nav class="flex text-sm text-text-secondary mb-4" aria-label="Breadcrumb">
 <ol class="inline-flex items-center space-x-1 md:space-x-3">
 <li class="inline-flex items-center">
 <router-link :to="homeLink" class="inline-flex items-center focus-visible:ring-2 focus:outline-none rounded hover:text-primary transition-colors">
 Home
 </router-link>
 </li>
 
 <li v-for="(item, index) in breadcrumbs" :key="index">
 <div class="flex items-center">
 <span class="mx-2 text-gray-400">/</span>
 <router-link 
 v-if="item.path && index < breadcrumbs.length - 1" 
 :to="item.path"
 class="hover:text-primary focus-visible:ring-2 focus:outline-none rounded transition-colors"
 >
 {{ item.name }}
 </router-link>
 <span v-else class="text-text-primary font-medium" aria-current="page">
 {{ item.name }}
 </span>
 </div>
 </li>
 </ol>
 </nav>
</template>
