<script setup lang="ts">
import ProfileForm from '../components/ProfileForm.vue'
import AvatarBannerUploader from '../components/AvatarBannerUploader.vue'
import CvUploader from '../components/CvUploader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <!-- Top Section: Avatar and Banner -->
      <AvatarBannerUploader />

      <div class="space-y-4">
        <!-- Main Profile Form -->
        <ProfileForm />

        <!-- CV Upload Section -->
        <CvUploader />
      </div>

    </div>
  </div>
</template>
