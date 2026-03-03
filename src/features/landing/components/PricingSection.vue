<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { Check } from "lucide-vue-next";

type BillingCycle = "monthly" | "yearly";

const billing = ref<BillingCycle>("monthly");

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number | null;
  description: string;
  popular: boolean;
  jobs: string;
  users: string;
  aiScreening: boolean;
  analytics: string;
  support: string;
  features: string[];
  cta: string;
  ctaLink: string;
}

const tiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 2900000,
    description: "Cho doanh nghiệp vừa bắt đầu",
    popular: false,
    jobs: "5 tin",
    users: "3 HR",
    aiScreening: false,
    analytics: "Cơ bản",
    support: "Email",
    features: [
      "5 tin tuyển dụng",
      "3 tài khoản HR",
      "Pipeline Kanban",
      "Báo cáo cơ bản",
      "Hỗ trợ qua email",
    ],
    cta: "Dùng thử miễn phí",
    ctaLink: "/register",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 6900000,
    description: "Cho team HR đang phát triển",
    popular: true,
    jobs: "30 tin",
    users: "15 HR",
    aiScreening: true,
    analytics: "Nâng cao",
    support: "Ưu tiên",
    features: [
      "30 tin tuyển dụng",
      "15 tài khoản HR",
      "AI Sàng lọc CV",
      "Pipeline Kanban nâng cao",
      "Analytics 20+ metrics",
      "Đăng tin đa kênh",
      "Tích hợp Google Calendar & Zoom",
      "Hỗ trợ ưu tiên",
    ],
    cta: "Bắt đầu dùng thử →",
    ctaLink: "/register",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    description: "Cho tập đoàn lớn, yêu cầu tùy chỉnh",
    popular: false,
    jobs: "Không giới hạn",
    users: "Không giới hạn",
    aiScreening: true,
    analytics: "Custom",
    support: "Dedicated CSM",
    features: [
      "Tin tuyển dụng không giới hạn",
      "Người dùng không giới hạn",
      "SSO & RBAC nâng cao",
      "Audit logs đầy đủ",
      "Analytics tùy chỉnh",
      "API riêng & tích hợp custom",
      "Dedicated Customer Success Manager",
      "SLA cam kết uptime 99.9%",
      "Đào tạo onboarding team",
    ],
    cta: "Liên hệ kinh doanh",
    ctaLink: "/contact",
  },
];

const YEARLY_DISCOUNT = 0.2;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price);
}

function getDisplayPrice(tier: PricingTier): string {
  if (tier.monthlyPrice === null) return "Liên hệ";
  const price =
    billing.value === "yearly"
      ? Math.round(tier.monthlyPrice * (1 - YEARLY_DISCOUNT))
      : tier.monthlyPrice;
  return formatPrice(price);
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
        <article v-for="tier in tiers" :key="tier.id">
          <div
            v-if="tier.popular"
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
                  {{ getDisplayPrice(tier) }}
                </span>
                <span
                  v-if="tier.monthlyPrice !== null"
                  class="text-white/60 text-sm mb-0.5"
                  >đ/tháng</span
                >
              </div>
              <p
                v-if="billing === 'yearly' && tier.monthlyPrice !== null"
                class="text-white/60 text-xs mt-1"
              >
                Thanh toán hàng năm
              </p>
            </div>

            <div class="flex-1">
              <ul class="space-y-3 mb-8">
                <li
                  v-for="feature in tier.features"
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
              :to="tier.ctaLink"
              class="mt-auto block text-center bg-white text-brand font-semibold rounded-lg py-3 text-sm hover:bg-brand-light transition-colors"
            >
              {{ tier.cta }}
            </RouterLink>
          </div>

          <div
            v-else
            class="h-full rounded-2xl bg-white p-8 border border-border flex flex-col"
            style="box-shadow: 0 1px 3px rgba(0, 100, 100, 0.06)"
          >
            <div class="mb-6">
              <h3 class="text-text-primary font-bold text-lg mb-1">
                {{ tier.name }}
              </h3>
              <p class="text-text-secondary text-xs">{{ tier.description }}</p>
            </div>

            <div class="mb-6">
              <div class="flex items-end gap-1.5">
                <span
                  class="font-mono text-4xl font-bold text-brand leading-none"
                >
                  {{ getDisplayPrice(tier) }}
                </span>
                <span
                  v-if="tier.monthlyPrice !== null"
                  class="text-text-muted text-sm mb-0.5"
                  >đ/tháng</span
                >
              </div>
              <p
                v-if="billing === 'yearly' && tier.monthlyPrice !== null"
                class="text-text-muted text-xs mt-1"
              >
                Thanh toán hàng năm
              </p>
            </div>

            <div class="flex-1">
              <ul class="space-y-3 mb-8">
                <li
                  v-for="feature in tier.features"
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
              :to="tier.ctaLink"
              class="mt-auto block text-center btn-secondary py-3 text-sm"
            >
              {{ tier.cta }}
            </RouterLink>
          </div>
        </article>
      </div>

      <!-- Bottom note -->
      <p class="text-center text-text-muted text-xs mt-12">
        Tất cả các gói đều bao gồm SSL, backup hàng ngày và uptime 99.9%. Hủy
        bất kỳ lúc nào.
      </p>
    </div>
  </section>
</template>
