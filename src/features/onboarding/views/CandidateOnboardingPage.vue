<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { Loader2 } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useOnboarding } from "@/features/onboarding/composables/useOnboarding";
import { CandidateUpdateRequestSchema } from "@/features/onboarding/types/onboarding.dto";
import type { WorkType } from "@/features/onboarding/types/onboarding.dto";

const onboarding = useOnboarding();

// ── Form state ──
const headline = ref("");
const summary = ref("");
const desiredPosition = ref("");
const desiredPositionLevel = ref("");
const yearsOfExperience = ref<number | undefined>(undefined);
const skills = ref<string[]>([]);
const skillInput = ref("");
const primaryLanguage = ref("");
const workType = ref<WorkType | undefined>(undefined);
const desiredSalaryMin = ref<number | undefined>(undefined);
const desiredSalaryMax = ref<number | undefined>(undefined);
const availableFrom = ref("");
const educationLevel = ref("");
const educationMajor = ref("");
const isOpenToWork = ref(true);

// ── Validation ──
const fieldErrors = ref<Record<string, string>>({});
const submitted = ref(false);

// Prefill form
onMounted(async () => {
  await onboarding.loadCandidateProfile();
  const p = onboarding.candidateProfile.value;
  if (p) {
    headline.value = p.headline ?? "";
    summary.value = p.summary ?? "";
    desiredPosition.value = p.desiredPosition ?? "";
    desiredPositionLevel.value = p.desiredPositionLevel ?? "";
    yearsOfExperience.value = p.yearsOfExperience ?? undefined;
    skills.value = p.skills ?? [];
    primaryLanguage.value = p.primaryLanguage ?? "";
    workType.value = (p.workType as WorkType) ?? undefined;
    desiredSalaryMin.value = p.desiredSalaryMin ?? undefined;
    desiredSalaryMax.value = p.desiredSalaryMax ?? undefined;
    availableFrom.value = p.availableFrom ?? "";
    educationLevel.value = p.educationLevel ?? "";
    educationMajor.value = p.educationMajor ?? "";
    isOpenToWork.value = p.isOpenToWork ?? true;
  }
});

// ── Skill tag management ──
function addSkill(): void {
  const val = skillInput.value.trim();
  if (val && !skills.value.includes(val)) {
    skills.value.push(val);
  }
  skillInput.value = "";
}
function removeSkill(index: number): void {
  skills.value.splice(index, 1);
}
function onSkillKeydown(e: KeyboardEvent): void {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addSkill();
  }
}

// ── Form payload builder ──
function buildPayload() {
  return {
    headline: headline.value || undefined,
    summary: summary.value || undefined,
    desiredPosition: desiredPosition.value || undefined,
    desiredPositionLevel: desiredPositionLevel.value || undefined,
    yearsOfExperience: yearsOfExperience.value,
    skills: skills.value.length > 0 ? skills.value : undefined,
    primaryLanguage: primaryLanguage.value || undefined,
    workType: workType.value,
    desiredSalaryMin: desiredSalaryMin.value,
    desiredSalaryMax: desiredSalaryMax.value,
    availableFrom: availableFrom.value || undefined,
    educationLevel: educationLevel.value || undefined,
    educationMajor: educationMajor.value || undefined,
    isOpenToWork: isOpenToWork.value,
  };
}

function validate(): boolean {
  const result = CandidateUpdateRequestSchema.safeParse(buildPayload());

  const errs: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!errs[key]) errs[key] = issue.message;
    }
  }
  fieldErrors.value = errs;
  return result.success;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;
  await onboarding.updateCandidateProfile(buildPayload());
}

// Formatted salary display
const formattedSalaryMin = computed(() =>
  desiredSalaryMin.value
    ? new Intl.NumberFormat("vi-VN").format(desiredSalaryMin.value)
    : "",
);
const formattedSalaryMax = computed(() =>
  desiredSalaryMax.value
    ? new Intl.NumberFormat("vi-VN").format(desiredSalaryMax.value)
    : "",
);

// Clear API error on input change
watch(
  [
    headline,
    summary,
    desiredPosition,
    desiredPositionLevel,
    yearsOfExperience,
    skills,
    primaryLanguage,
    workType,
  ],
  () => {
    if (onboarding.hasError.value) onboarding.clearError();
  },
);

// ── Work type options ──
const workTypeOptions = [
  { value: "REMOTE", label: "Từ xa" },
  { value: "ONSITE", label: "Tại văn phòng" },
  { value: "HYBRID", label: "Kết hợp" },
] as const;
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2
        class="font-display text-4xl font-bold text-white leading-tight mb-6"
      >
        Hoàn thiện hồ sơ<br />ứng viên của bạn
      </h2>
      <p class="text-white/80 text-sm leading-relaxed mb-6">
        Hồ sơ đầy đủ giúp nhà tuyển dụng tìm thấy bạn nhanh hơn. AI của chúng
        tôi sẽ gợi ý việc làm phù hợp dựa trên thông tin bạn cung cấp.
      </p>
      <ul class="space-y-3">
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
          Gợi ý việc làm chính xác hơn với AI
        </li>
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
          Nhà tuyển dụng tìm thấy bạn dễ dàng
        </li>
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
          Ứng tuyển nhanh chóng, 1 click
        </li>
      </ul>
    </template>

    <!-- Right panel form -->
    <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
      Hồ sơ ứng viên
    </h2>
    <p class="text-text-secondary text-sm mb-6">
      Điền thông tin để AI gợi ý việc làm phù hợp nhất
    </p>

    <!-- API error alert -->
    <div
      v-if="onboarding.error.value"
      role="alert"
      class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ onboarding.error.value }}
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <!-- Headline -->
      <div>
        <label
          for="onboard-headline"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Headline
        </label>
        <input
          id="onboard-headline"
          v-model="headline"
          type="text"
          placeholder="Senior Backend Engineer"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.headline }"
        />
        <p
          v-if="submitted && fieldErrors.headline"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.headline }}
        </p>
      </div>

      <!-- Summary -->
      <div>
        <label
          for="onboard-summary"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Giới thiệu bản thân
        </label>
        <textarea
          id="onboard-summary"
          v-model="summary"
          rows="3"
          placeholder="Mô tả ngắn gọn về kinh nghiệm và mục tiêu nghề nghiệp..."
          class="input resize-none"
          :class="{ '!border-danger': submitted && fieldErrors.summary }"
        />
        <p
          v-if="submitted && fieldErrors.summary"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.summary }}
        </p>
      </div>

      <!-- Desired Position + Level (2 cols) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="onboard-position"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Vị trí mong muốn
          </label>
          <input
            id="onboard-position"
            v-model="desiredPosition"
            type="text"
            placeholder="Backend Engineer"
            maxlength="100"
            class="input"
            :class="{
              '!border-danger': submitted && fieldErrors.desiredPosition,
            }"
          />
        </div>
        <div>
          <label
            for="onboard-level"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Cấp bậc
          </label>
          <input
            id="onboard-level"
            v-model="desiredPositionLevel"
            type="text"
            placeholder="Senior"
            maxlength="50"
            class="input"
            :class="{
              '!border-danger':
                submitted && fieldErrors.desiredPositionLevel,
            }"
          />
        </div>
      </div>

      <!-- Years of exp + Work type (2 cols) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="onboard-experience"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Năm kinh nghiệm
          </label>
          <input
            id="onboard-experience"
            v-model.number="yearsOfExperience"
            type="number"
            min="0"
            max="50"
            placeholder="5"
            class="input"
            :class="{
              '!border-danger': submitted && fieldErrors.yearsOfExperience,
            }"
          />
        </div>
        <div>
          <label
            for="onboard-worktype"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Hình thức
          </label>
          <select
            id="onboard-worktype"
            v-model="workType"
            class="input"
          >
            <option :value="undefined" disabled>Chọn hình thức</option>
            <option
              v-for="opt in workTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Skills (tag input) -->
      <div>
        <label
          for="onboard-skills"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Kỹ năng
        </label>
        <div class="flex flex-wrap gap-1.5 mb-2" v-if="skills.length">
          <span
            v-for="(skill, i) in skills"
            :key="i"
            class="inline-flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2 py-1 rounded-md"
          >
            {{ skill }}
            <button
              type="button"
              class="hover:text-danger transition-colors"
              @click="removeSkill(i)"
            >
              <span class="font-bold -translate-y-[0.5px]">✕</span>
            </button>
          </span>
        </div>
        <input
          id="onboard-skills"
          v-model="skillInput"
          type="text"
          placeholder="Nhập kỹ năng rồi nhấn Enter"
          class="input"
          @keydown="onSkillKeydown"
          @blur="addSkill"
        />
      </div>

      <!-- Primary Language + Education (2 cols) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="onboard-lang"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Ngôn ngữ chính
          </label>
          <input
            id="onboard-lang"
            v-model="primaryLanguage"
            type="text"
            placeholder="Java"
            maxlength="50"
            class="input"
          />
        </div>
        <div>
          <label
            for="onboard-edu-level"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Trình độ học vấn
          </label>
          <input
            id="onboard-edu-level"
            v-model="educationLevel"
            type="text"
            placeholder="Bachelor"
            maxlength="50"
            class="input"
          />
        </div>
      </div>

      <!-- Education Major -->
      <div>
        <label
          for="onboard-edu-major"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Chuyên ngành
        </label>
        <input
          id="onboard-edu-major"
          v-model="educationMajor"
          type="text"
          placeholder="Computer Science"
          maxlength="100"
          class="input"
        />
      </div>

      <!-- Salary range (2 cols) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="onboard-salary-min"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Lương mong muốn (min)
          </label>
          <input
            id="onboard-salary-min"
            v-model.number="desiredSalaryMin"
            type="number"
            min="0"
            placeholder="15,000,000"
            class="input"
          />
          <p v-if="formattedSalaryMin" class="text-text-muted text-xs mt-1">
            {{ formattedSalaryMin }} VND
          </p>
        </div>
        <div>
          <label
            for="onboard-salary-max"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Lương mong muốn (max)
          </label>
          <input
            id="onboard-salary-max"
            v-model.number="desiredSalaryMax"
            type="number"
            min="0"
            placeholder="30,000,000"
            class="input"
          />
          <p v-if="formattedSalaryMax" class="text-text-muted text-xs mt-1">
            {{ formattedSalaryMax }} VND
          </p>
        </div>
      </div>

      <!-- Available from -->
      <div>
        <label
          for="onboard-available"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Ngày có thể bắt đầu
        </label>
        <input
          id="onboard-available"
          v-model="availableFrom"
          type="date"
          class="input"
        />
      </div>

      <!-- Open to work toggle -->
      <div>
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative">
            <input
              type="checkbox"
              v-model="isOpenToWork"
              class="sr-only"
            />
            <div
              class="w-10 h-5 rounded-full transition-colors duration-200"
              :class="isOpenToWork ? 'bg-brand' : 'bg-border-strong'"
            />
            <div
              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="isOpenToWork ? 'translate-x-5' : 'translate-x-0'"
            />
          </div>
          <span class="text-sm text-text-primary">Sẵn sàng nhận cơ hội mới</span>
        </label>
      </div>

      <!-- Submit -->
      <button
        id="onboard-candidate-submit"
        type="submit"
        class="btn-primary w-full py-3 text-base mt-2"
        :disabled="onboarding.isLoading.value"
      >
        <Loader2
          v-if="onboarding.isLoading.value"
          :size="18"
          class="animate-spin"
          aria-hidden="true"
        />
        <span v-else>Hoàn tất hồ sơ</span>
      </button>
    </form>
  </AuthLayout>
</template>
