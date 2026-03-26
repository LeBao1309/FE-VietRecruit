<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { Loader2 } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useOnboarding } from "@/features/onboarding/composables/useOnboarding";
import { CompanyUpdateRequestSchema } from "@/features/onboarding/types/onboarding.dto";

const onboarding = useOnboarding();

// ── Form state ──
const name = ref("");
const domain = ref("");
const website = ref("");

// ── Validation ──
type FieldName = "name" | "domain" | "website";
const fieldErrors = ref<Partial<Record<FieldName, string>>>({});
const submitted = ref(false);

// Prefill form with existing data if available
onMounted(async () => {
  await onboarding.loadCompany();
  if (onboarding.companyProfile.value) {
    name.value = onboarding.companyProfile.value.name ?? "";
    domain.value = onboarding.companyProfile.value.domain ?? "";
    website.value = onboarding.companyProfile.value.website ?? "";
  }
});

function validate(): boolean {
  const result = CompanyUpdateRequestSchema.safeParse({
    name: name.value,
    domain: domain.value || undefined,
    website: website.value || undefined,
  });

  const errs: Partial<Record<FieldName, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]) as FieldName;
      if (!errs[key]) errs[key] = issue.message;
    }
  }
  fieldErrors.value = errs;
  return result.success;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  const payload = {
    name: name.value,
    domain: domain.value || undefined,
    website: website.value || undefined,
  };

  if (onboarding.companyProfile.value) {
    await onboarding.updateCompany(payload);
  } else {
    await onboarding.createCompany(payload);
  }
}

// Clear API error on input change
watch([name, domain, website], () => {
  if (onboarding.hasError.value) onboarding.clearError();
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Thiết lập công ty<br />của bạn
      </h2>
      <p class="text-white/80 text-sm leading-relaxed mb-6">
        Hoàn tất thông tin để bắt đầu đăng tin tuyển dụng và quản lý ứng viên
        trên VietRecruit.
      </p>
      <ul class="space-y-3">
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">1</span>
          Nhập tên công ty và lĩnh vực hoạt động
        </li>
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">2</span>
          Mời thành viên HR & Interviewer
        </li>
        <li class="flex items-center gap-3 text-white/80 text-sm">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">3</span>
          Đăng tin tuyển dụng đầu tiên
        </li>
      </ul>
    </template>

    <!-- Right panel form -->
    <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
      Thông tin công ty
    </h2>
    <p class="text-text-secondary text-sm mb-8">
      Cập nhật thông tin cơ bản về công ty của bạn
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
      <!-- Company Name -->
      <div>
        <label
          for="onboard-company-name"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Tên công ty <span class="text-danger">*</span>
        </label>
        <input
          id="onboard-company-name"
          v-model="name"
          type="text"
          autocomplete="organization"
          placeholder="Công ty TNHH ABC"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.name }"
        />
        <p
          v-if="submitted && fieldErrors.name"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.name }}
        </p>
      </div>

      <!-- Domain / Industry -->
      <div>
        <label
          for="onboard-company-domain"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Lĩnh vực hoạt động
          <span class="normal-case tracking-normal font-normal text-text-muted">(Tùy chọn)</span>
        </label>
        <input
          id="onboard-company-domain"
          v-model="domain"
          type="text"
          placeholder="Công nghệ thông tin"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.domain }"
        />
        <p
          v-if="submitted && fieldErrors.domain"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.domain }}
        </p>
      </div>

      <!-- Website -->
      <div>
        <label
          for="onboard-company-website"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Website
          <span class="normal-case tracking-normal font-normal text-text-muted">(Tùy chọn)</span>
        </label>
        <input
          id="onboard-company-website"
          v-model="website"
          type="url"
          placeholder="https://abc.com.vn"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.website }"
        />
        <p
          v-if="submitted && fieldErrors.website"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.website }}
        </p>
      </div>

      <!-- Submit -->
      <button
        id="onboard-employer-submit"
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
        <span v-else>Hoàn tất thiết lập</span>
      </button>
    </form>
  </AuthLayout>
</template>
