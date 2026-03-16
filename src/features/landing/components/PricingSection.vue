<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { Check, Loader2 } from "lucide-vue-next";
import { usePlanStore } from "@/features/plan/stores/plan.store";
import type { PlanResponse } from "@/features/plan/types/plan.dto";

type BillingCycle = "monthly" | "yearly";

const billing = ref<BillingCycle>("monthly");
const planStore = usePlanStore();

onMounted(() => {
  planStore.fetchPlans();
});

// ── Derived state from API data ──

/** Map a PlanResponse into feature bullet strings for UI display */
function buildFeatureList(plan: PlanResponse): string[] {
  const features: string[] = [];

  if (plan.maxActiveJobs === -1) {
    features.push("Tin tuyển dụng không giới hạn");
  } else {
    features.push(`${plan.maxActiveJobs} tin tuyển dụng`);
  }

  features.push(`Hiển thị ${plan.jobDurationDays} ngày`);

  if (plan.resumeAccess) features.push("Truy cập hồ sơ ứng viên");
  if (plan.aiMatching) features.push("AI Sàng lọc & đối sánh CV");
  if (plan.priorityListing) features.push("Ưu tiên hiển thị tin tuyển dụng");

  return features;
}

/** Determine if a plan should be "popular" — pick PREMIUM as the highlighted plan */
function isPopular(plan: PlanResponse): boolean {
  return plan.code === "PREMIUM";
}

/** Determine if a plan is enterprise (contact us) */
function isEnterprise(plan: PlanResponse): boolean {
  return plan.code === "ENTERPRISE";
}

/** Visible plans: hide DEV plan (internal testing only) */
const visiblePlans = computed(() =>
  planStore.plans.filter((p) => p.code !== "DEV"),
);

const YEARLY_DISCOUNT = 0.2;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price);
}

function getDisplayPrice(plan: PlanResponse): string {
  if (isEnterprise(plan)) return "Liên hệ";
  if (billing.value === "yearly" && plan.priceYearly != null) {
    return formatPrice(Math.round(plan.priceYearly / 12));
  }
  return formatPrice(plan.priceMonthly);
}

function getCtaText(plan: PlanResponse): string {
  if (isEnterprise(plan)) return "Liên hệ kinh doanh";
  if (plan.priceMonthly === 0) return "Dùng thử miễn phí";
  return "Bắt đầu dùng thử →";
}

function getCtaLink(plan: PlanResponse): string {
  if (isEnterprise(plan)) return "/contact";
  return "/auth/register";
}

const yearlySavingLabel = computed(
  () => `Tiết kiệm ${Math.round(YEARLY_DISCOUNT * 100)}% mỗi năm`,
);
</script>

<template>
  <section id="pricing" class="py-24 px-6 bg-surface" aria-label="Bảng giá">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-14">
        <span class="section-badge mb-4"> Bảng giá </span>
        <h2
          class="font-display text-4xl md:text-5xl text-text-primary mb-4 font-bold"
        >
          Minh bạch. Không ẩn phí.
        </h2>
        <p class="text-text-secondary text-base max-w-lg mx-auto">
          Bắt đầu miễn phí 14 ngày với Growth plan. Không cần thẻ tín dụng.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="planStore.isLoading" class="flex justify-center py-20">
        <Loader2 :size="32" class="animate-spin text-brand" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="planStore.error"
        class="text-center py-16 text-text-secondary"
      >
        <p class="text-sm mb-2">Không thể tải bảng giá.</p>
        <button
          type="button"
          class="text-brand text-sm font-medium hover:underline"
          @click="planStore.clearError(); planStore.fetchPlans()"
        >
          Thử lại
        </button>
      </div>

      <template v-else>
        <!-- Billing Toggle -->
        <div
          class="flex items-center justify-center gap-4 mb-12"
          role="group"
          aria-label="Chu kỳ thanh toán"
        >
          <span
            :class="
              billing === 'monthly'
                ? 'text-text-primary font-semibold'
                : 'text-text-secondary'
            "
            class="text-sm transition-colors"
          >
            Hàng tháng
          </span>
          <button
            type="button"
            :aria-label="`Chuyển sang thanh toán ${billing === 'monthly' ? 'hàng năm' : 'hàng tháng'}`"
            :aria-pressed="billing === 'yearly'"
            class="relative w-12 h-6 rounded-full transition-colors duration-200"
            :class="
              billing === 'yearly'
                ? 'bg-brand'
                : 'bg-surface-muted border border-border'
            "
            @click="billing = billing === 'monthly' ? 'yearly' : 'monthly'"
          >
            <span
              class="absolute top-[2px] left-[2px] w-4 h-4 rounded-full transition-transform duration-200"
              :class="[
                billing === 'yearly'
                  ? 'translate-x-[22px] bg-white'
                  : 'translate-x-0 bg-text-secondary',
              ]"
            />
          </button>
          <span class="flex items-center gap-2">
            <span
              :class="
                billing === 'yearly'
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary'
              "
              class="text-sm transition-colors"
            >
              Hàng năm
            </span>
            <span
              v-if="billing === 'yearly'"
              class="px-2 py-0.5 rounded-full bg-success-light text-success-dark text-[10px] font-semibold"
            >
              {{ yearlySavingLabel }}
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary text-[10px] font-medium border border-border"
            >
              Tiết kiệm 20%
            </span>
          </span>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-5 items-stretch">
          <article v-for="plan in visiblePlans" :key="plan.id">
            <!-- Popular plan (highlighted) -->
            <div
              v-if="isPopular(plan)"
              class="h-full rounded-2xl bg-brand p-8 text-white ring-4 ring-brand/20 lg:scale-105 shadow-brand-lg relative flex flex-col"
            >
              <div
                class="text-xs font-semibold uppercase tracking-widest text-white/70 mb-4"
              >
                Phổ biến nhất
              </div>

              <div class="mb-6">
                <div class="flex items-end gap-1.5">
                  <span
                    class="font-mono text-4xl font-bold text-white leading-none"
                  >
                    {{ getDisplayPrice(plan) }}
                  </span>
                  <span
                    v-if="!isEnterprise(plan)"
                    class="text-white/60 text-sm mb-0.5"
                    >đ/tháng</span
                  >
                </div>
                <p
                  v-if="billing === 'yearly' && !isEnterprise(plan)"
                  class="text-white/60 text-xs mt-1"
                >
                  Thanh toán hàng năm
                </p>
              </div>

              <div class="flex-1">
                <ul class="space-y-3 mb-8">
                  <li
                    v-for="feature in buildFeatureList(plan)"
                    :key="feature"
                    class="flex items-start gap-2.5 text-sm text-white/90"
                  >
                    <Check
                      :size="14"
                      class="text-white flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <RouterLink
                :to="getCtaLink(plan)"
                class="mt-auto block text-center bg-white text-brand font-semibold rounded-lg py-3 text-sm hover:bg-brand-light transition-colors"
              >
                {{ getCtaText(plan) }}
              </RouterLink>
            </div>

            <!-- Normal plan -->
            <div
              v-else
              class="h-full rounded-2xl bg-white p-8 border border-border flex flex-col"
              style="box-shadow: 0 1px 3px rgba(0, 100, 100, 0.06)"
            >
              <div class="mb-6">
                <h3 class="text-text-primary font-bold text-lg mb-1">
                  {{ plan.name }}
                </h3>
                <p class="text-text-secondary text-xs">{{ plan.description }}</p>
              </div>

              <div class="mb-6">
                <div class="flex items-end gap-1.5">
                  <span
                    class="font-mono text-4xl font-bold text-brand leading-none"
                  >
                    {{ getDisplayPrice(plan) }}
                  </span>
                  <span
                    v-if="!isEnterprise(plan)"
                    class="text-text-muted text-sm mb-0.5"
                    >đ/tháng</span
                  >
                </div>
                <p
                  v-if="billing === 'yearly' && !isEnterprise(plan)"
                  class="text-text-muted text-xs mt-1"
                >
                  Thanh toán hàng năm
                </p>
              </div>

              <div class="flex-1">
                <ul class="space-y-3 mb-8">
                  <li
                    v-for="feature in buildFeatureList(plan)"
                    :key="feature"
                    class="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <Check
                      :size="14"
                      class="text-brand flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <RouterLink
                :to="getCtaLink(plan)"
                class="mt-auto block text-center btn-secondary py-3 text-sm"
              >
                {{ getCtaText(plan) }}
              </RouterLink>
            </div>
          </article>
        </div>
      </template>

      <!-- Bottom note -->
      <p class="text-center text-text-muted text-xs mt-12">
        Tất cả các gói đều bao gồm SSL, backup hàng ngày và uptime 99.9%. Hủy
        bất kỳ lúc nào.
      </p>
    </div>
  </section>
</template>
