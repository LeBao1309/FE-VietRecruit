<script setup lang="ts">
import ProfileForm from '../components/ProfileForm.vue'
import AvatarBannerUploader from '../components/AvatarBannerUploader.vue'
import CvUploader from '../components/CvUploader.vue'
</script>

<template>
  <div class="py-6 sm:py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <AvatarBannerUploader />
      <ProfileForm />
      <CvUploader />
    </div>
  </div>
</template>
