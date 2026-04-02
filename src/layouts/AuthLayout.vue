<script setup lang="ts">
</script>

<template>
 <div class="min-h-screen flex flex-col items-center bg-slate-50">
 <div class="p-6">
 <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
 </div>
 <main class="w-full max-w-[440px] px-4">
 <router-view />
 </main>
 </div>
</template>
