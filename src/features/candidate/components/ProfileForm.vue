<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { ref, onMounted, reactive, computed } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { candidateService } from '../services/candidate.service'
import { userService } from '../services/user.service'
import type { CandidateUpdateRequest, UserUpdateRequest } from '../types/candidate.schema'

const toast = useToast()
const candidateStore = useCandidateStore()

const userForm = reactive<UserUpdateRequest>({
  fullName: '',
  phone: '',
  location: '',
  dob: '',
  gender: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
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
  isOpenToWork: true,
})

const isSaving = ref(false)
const skillInput = ref('')

const workTypeOptions = [
  { value: 'REMOTE', label: 'Tu xa' },
  { value: 'ONSITE', label: 'Tai van phong' },
  { value: 'HYBRID', label: 'Ket hop' },
  { value: 'ANY', label: 'Bat ky' },
] as const

const genderOptions = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nu' },
  { value: 'OTHER', label: 'Khac' },
] as const

onMounted(async () => {
  candidateStore.isLoading = true
  try {
    const [userProfile, candProfile] = await Promise.all([
      userService.getUserProfile(),
      candidateService.getProfile(),
    ])
    candidateStore.userProfile = userProfile
    candidateStore.candidateProfile = candProfile

    Object.assign(userForm, {
      fullName: userProfile.fullName || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      dob: userProfile.dob || '',
      gender: userProfile.gender || '',
      linkedinUrl: userProfile.linkedinUrl || '',
      githubUrl: userProfile.githubUrl || '',
      portfolioUrl: userProfile.portfolioUrl || '',
    })

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
      isOpenToWork: candProfile.isOpenToWork ?? true,
    })
  } catch {
    candidateStore.error = 'Khong the tai du lieu ho so.'
  } finally {
    candidateStore.isLoading = false
  }
})

function addSkill(): void {
  const val = skillInput.value.trim()
  if (val && !candidateForm.skills?.includes(val)) {
    if (!candidateForm.skills) candidateForm.skills = []
    candidateForm.skills.push(val)
  }
  skillInput.value = ''
}

function removeSkill(index: number): void {
  candidateForm.skills?.splice(index, 1)
}

function onSkillKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  }
}

const formattedSalaryMin = computed(() =>
  candidateForm.desiredSalaryMin
    ? new Intl.NumberFormat('vi-VN').format(candidateForm.desiredSalaryMin)
    : '',
)
const formattedSalaryMax = computed(() =>
  candidateForm.desiredSalaryMax
    ? new Intl.NumberFormat('vi-VN').format(candidateForm.desiredSalaryMax)
    : '',
)

const saveProfile = async () => {
  isSaving.value = true
  try {
    const [userResponse, candResponse] = await Promise.all([
      userService.updateUserProfile(userForm),
      candidateService.updateProfile(candidateForm),
    ])
    candidateStore.userProfile = userResponse
    candidateStore.candidateProfile = candResponse
    toast.success('Luu ho so thanh cong!')
  } catch {
    toast.error('Luu ho so that bai. Vui long thu lai.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-panel rounded-2xl border border-border p-6 sm:p-8">
    <!-- Loading skeleton -->
    <div v-if="candidateStore.isLoading" class="animate-pulse space-y-6">
      <div class="h-5 bg-surface-muted rounded w-40"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="h-11 bg-surface-muted rounded-lg"></div>
        <div class="h-11 bg-surface-muted rounded-lg"></div>
        <div class="h-11 bg-surface-muted rounded-lg"></div>
        <div class="h-11 bg-surface-muted rounded-lg"></div>
      </div>
      <div class="h-24 bg-surface-muted rounded-lg"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="h-11 bg-surface-muted rounded-lg"></div>
        <div class="h-11 bg-surface-muted rounded-lg"></div>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveProfile" class="space-y-8">
      <!-- Section: Thong tin ca nhan -->
      <section>
        <h2 class="text-lg font-semibold text-text-primary mb-1">Thong tin ca nhan</h2>
        <p class="text-text-muted text-sm mb-5">Thong tin co ban de nha tuyen dung lien he voi ban</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="pf-fullname" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Ho va ten *
            </label>
            <input
              id="pf-fullname"
              v-model="userForm.fullName"
              required
              type="text"
              placeholder="Nguyen Van A"
              class="input"
            />
          </div>

          <div>
            <label for="pf-phone" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              So dien thoai
            </label>
            <input
              id="pf-phone"
              v-model="userForm.phone"
              type="tel"
              placeholder="0901 234 567"
              class="input"
            />
          </div>

          <div>
            <label for="pf-dob" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Ngay sinh
            </label>
            <input
              id="pf-dob"
              v-model="userForm.dob"
              type="date"
              class="input"
            />
          </div>

          <div>
            <label for="pf-gender" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Gioi tinh
            </label>
            <select id="pf-gender" v-model="userForm.gender" class="input">
              <option value="" disabled>Chon gioi tinh</option>
              <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="pf-location" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Khu vuc lam viec
            </label>
            <input
              id="pf-location"
              v-model="userForm.location"
              type="text"
              placeholder="TP. Ho Chi Minh"
              class="input"
            />
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-border-subtle"></div>

      <!-- Section: Ho so nghe nghiep -->
      <section>
        <h2 class="text-lg font-semibold text-text-primary mb-1">Ho so nghe nghiep</h2>
        <p class="text-text-muted text-sm mb-5">Thong tin nay giup AI goi y viec lam phu hop nhat</p>

        <div class="space-y-4">
          <div>
            <label for="pf-headline" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Headline
            </label>
            <input
              id="pf-headline"
              v-model="candidateForm.headline"
              type="text"
              placeholder="VD: Senior Backend Engineer"
              maxlength="255"
              class="input"
            />
          </div>

          <div>
            <label for="pf-summary" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Gioi thieu ban than
            </label>
            <textarea
              id="pf-summary"
              v-model="candidateForm.summary"
              rows="4"
              placeholder="Mo ta ngan gon ve kinh nghiem va muc tieu nghe nghiep cua ban..."
              class="input resize-none"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="pf-position" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Vi tri mong muon
              </label>
              <input
                id="pf-position"
                v-model="candidateForm.desiredPosition"
                type="text"
                placeholder="Backend Engineer"
                maxlength="100"
                class="input"
              />
            </div>

            <div>
              <label for="pf-level" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Cap bac
              </label>
              <input
                id="pf-level"
                v-model="candidateForm.desiredPositionLevel"
                type="text"
                placeholder="Senior"
                maxlength="50"
                class="input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="pf-experience" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                So nam kinh nghiem
              </label>
              <input
                id="pf-experience"
                v-model.number="candidateForm.yearsOfExperience"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                class="input"
              />
            </div>

            <div>
              <label for="pf-worktype" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Hinh thuc lam viec
              </label>
              <select id="pf-worktype" v-model="candidateForm.workType" class="input">
                <option :value="undefined" disabled>Chon hinh thuc</option>
                <option v-for="opt in workTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Skills tag input -->
          <div>
            <label for="pf-skills" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Ky nang
            </label>
            <div v-if="candidateForm.skills?.length" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="(skill, i) in candidateForm.skills"
                :key="i"
                class="inline-flex items-center gap-1 bg-brand-light text-brand-darker text-xs font-medium px-2.5 py-1 rounded-md"
              >
                {{ skill }}
                <button
                  type="button"
                  class="hover:text-danger transition-colors ml-0.5"
                  @click="removeSkill(i)"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <input
              id="pf-skills"
              v-model="skillInput"
              type="text"
              placeholder="Nhap ky nang roi nhan Enter"
              class="input"
              @keydown="onSkillKeydown"
              @blur="addSkill"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="pf-lang" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Ngon ngu chinh
              </label>
              <input
                id="pf-lang"
                v-model="candidateForm.primaryLanguage"
                type="text"
                placeholder="Java"
                maxlength="50"
                class="input"
              />
            </div>

            <div>
              <label for="pf-available" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Ngay co the bat dau
              </label>
              <input
                id="pf-available"
                v-model="candidateForm.availableFrom"
                type="date"
                class="input"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-border-subtle"></div>

      <!-- Section: Hoc van -->
      <section>
        <h2 class="text-lg font-semibold text-text-primary mb-1">Hoc van</h2>
        <p class="text-text-muted text-sm mb-5">Trinh do hoc van cua ban</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="pf-edu-level" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Trinh do
            </label>
            <input
              id="pf-edu-level"
              v-model="candidateForm.educationLevel"
              type="text"
              placeholder="Cu nhan / Thac si"
              maxlength="50"
              class="input"
            />
          </div>

          <div>
            <label for="pf-edu-major" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Chuyen nganh
            </label>
            <input
              id="pf-edu-major"
              v-model="candidateForm.educationMajor"
              type="text"
              placeholder="Khoa hoc May tinh"
              maxlength="100"
              class="input"
            />
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-border-subtle"></div>

      <!-- Section: Muc luong mong muon -->
      <section>
        <h2 class="text-lg font-semibold text-text-primary mb-1">Muc luong mong muon</h2>
        <p class="text-text-muted text-sm mb-5">Giup nha tuyen dung hieu ky vong cua ban</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="pf-salary-min" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Luong toi thieu (VND)
            </label>
            <input
              id="pf-salary-min"
              v-model.number="candidateForm.desiredSalaryMin"
              type="number"
              min="0"
              placeholder="15000000"
              class="input"
            />
            <p v-if="formattedSalaryMin" class="text-text-muted text-xs mt-1">
              {{ formattedSalaryMin }} VND
            </p>
          </div>

          <div>
            <label for="pf-salary-max" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Luong toi da (VND)
            </label>
            <input
              id="pf-salary-max"
              v-model.number="candidateForm.desiredSalaryMax"
              type="number"
              min="0"
              placeholder="30000000"
              class="input"
            />
            <p v-if="formattedSalaryMax" class="text-text-muted text-xs mt-1">
              {{ formattedSalaryMax }} VND
            </p>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-border-subtle"></div>

      <!-- Section: Lien ket -->
      <section>
        <h2 class="text-lg font-semibold text-text-primary mb-1">Lien ket mang xa hoi</h2>
        <p class="text-text-muted text-sm mb-5">Ho so truc tuyen cua ban</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="pf-linkedin" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              LinkedIn
            </label>
            <input
              id="pf-linkedin"
              v-model="userForm.linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/..."
              class="input"
            />
          </div>

          <div>
            <label for="pf-github" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              GitHub
            </label>
            <input
              id="pf-github"
              v-model="userForm.githubUrl"
              type="url"
              placeholder="https://github.com/..."
              class="input"
            />
          </div>

          <div>
            <label for="pf-portfolio" class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Portfolio
            </label>
            <input
              id="pf-portfolio"
              v-model="userForm.portfolioUrl"
              type="url"
              placeholder="https://..."
              class="input"
            />
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-border-subtle"></div>

      <!-- Open to work toggle + Submit -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative">
            <input type="checkbox" v-model="candidateForm.isOpenToWork" class="sr-only" />
            <div
              class="w-11 h-6 rounded-full transition-colors duration-200"
              :class="candidateForm.isOpenToWork ? 'bg-brand' : 'bg-border-strong'"
            />
            <div
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              :class="candidateForm.isOpenToWork ? 'translate-x-5' : 'translate-x-0'"
            />
          </div>
          <span class="text-sm text-text-primary font-medium">San sang nhan co hoi moi</span>
        </label>

        <button
          type="submit"
          :disabled="isSaving"
          class="btn-primary px-8 py-2.5"
        >
          {{ isSaving ? 'Dang luu...' : 'Luu thay doi' }}
        </button>
      </div>
    </form>
  </div>
</template>
