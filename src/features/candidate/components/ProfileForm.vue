<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { candidateService } from '../services/candidate.service'
import { userService } from '../services/user.service'
import type { CandidateUpdateRequest, UserUpdateRequest } from '../types/candidate.schema'

const candidateStore = useCandidateStore()

const userForm = reactive<UserUpdateRequest>({
  fullName: '',
  phone: '',
  location: '',
  dob: '',
  gender: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: ''
})

const candidateForm = reactive<CandidateUpdateRequest>({
  headline: '',
  summary: '',
  desiredPosition: '',
  desiredPositionLevel: '',
  yearsOfExperience: undefined,
  skills: [],
  primaryLanguage: '',
  workType: undefined,
  desiredSalaryMin: undefined,
  desiredSalaryMax: undefined,
  availableFrom: '',
  educationLevel: '',
  educationMajor: '',
  isOpenToWork: true
})

const isSaving = ref(false)

onMounted(async () => {
  candidateStore.isLoading = true
  try {
    const [userProfile, candProfile] = await Promise.all([
      userService.getUserProfile(),
      candidateService.getProfile()
    ])
    candidateStore.userProfile = userProfile
    candidateStore.candidateProfile = candProfile

    // Populate user form
    Object.assign(userForm, {
      fullName: userProfile.fullName || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      dob: userProfile.dob || '',
      gender: userProfile.gender || '',
      linkedinUrl: userProfile.linkedinUrl || '',
      githubUrl: userProfile.githubUrl || '',
      portfolioUrl: userProfile.portfolioUrl || ''
    })

    // Populate candidate form
    Object.assign(candidateForm, {
      headline: candProfile.headline || '',
      summary: candProfile.summary || '',
      desiredPosition: candProfile.desiredPosition || '',
      desiredPositionLevel: candProfile.desiredPositionLevel || '',
      yearsOfExperience: candProfile.yearsOfExperience,
      skills: candProfile.skills || [],
      primaryLanguage: candProfile.primaryLanguage || '',
      workType: candProfile.workType as any,
      desiredSalaryMin: candProfile.desiredSalaryMin,
      desiredSalaryMax: candProfile.desiredSalaryMax,
      availableFrom: candProfile.availableFrom || '',
      educationLevel: candProfile.educationLevel || '',
      educationMajor: candProfile.educationMajor || '',
      isOpenToWork: candProfile.isOpenToWork ?? true
    })
  } catch (err) {
    candidateStore.error = 'Failed to load profile data.'
  } finally {
    candidateStore.isLoading = false
  }
})

const saveProfile = async () => {
  isSaving.value = true
  try {
    const [userResponse, candResponse] = await Promise.all([
      userService.updateUserProfile(userForm),
      candidateService.updateProfile(candidateForm)
    ])
    candidateStore.userProfile = userResponse
    candidateStore.candidateProfile = candResponse
    alert('Profile saved successfully!')
  } catch (err) {
    alert('Failed to save profile.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
    
    <div v-if="candidateStore.isLoading" class="animate-pulse space-y-4">
      <div class="h-10 bg-gray-200 rounded w-full"></div>
      <div class="h-10 bg-gray-200 rounded w-full"></div>
      <div class="h-10 bg-gray-200 rounded w-full"></div>
    </div>

    <form v-else @submit.prevent="saveProfile" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- User Info -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Họ và tên *</label>
          <input v-model="userForm.fullName" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input v-model="userForm.phone" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Vị trí hiện tại (Headline)</label>
          <input v-model="candidateForm.headline" type="text" placeholder="VD: Senior Frontend Developer" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Khu vực làm việc</label>
          <input v-model="userForm.location" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Giới thiệu bản thân (Summary)</label>
        <textarea v-model="candidateForm.summary" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Vị trí mong muốn</label>
          <input v-model="candidateForm.desiredPosition" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Số năm kinh nghiệm</label>
          <input v-model.number="candidateForm.yearsOfExperience" type="number" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">LinkedIn</label>
          <input v-model="userForm.linkedinUrl" type="url" placeholder="https://" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">GitHub</label>
          <input v-model="userForm.githubUrl" type="url" placeholder="https://" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Portfolio</label>
          <input v-model="userForm.portfolioUrl" type="url" placeholder="https://" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button type="submit" :disabled="isSaving" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
        </button>
      </div>
    </form>
  </div>
</template>
