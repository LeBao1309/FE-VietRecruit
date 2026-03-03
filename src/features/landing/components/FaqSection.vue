<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "VietRecruit có tích hợp với các job board Việt Nam không?",
    answer:
      "Có. VietRecruit tích hợp trực tiếp với VietnamWorks, TopCV, CareerLink, JobsGO và LinkedIn. Bạn chỉ cần đăng tin một lần, hệ thống tự đồng bộ lên tất cả các kênh và thu thập ứng viên về một dashboard duy nhất.",
  },
  {
    id: "faq-2",
    question: "Dữ liệu của chúng tôi có được bảo mật không?",
    answer:
      "Dữ liệu của bạn được lưu trữ trên hạ tầng đám mây tại Việt Nam, tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Chúng tôi áp dụng mã hóa AES-256, audit log đầy đủ, và đạt chuẩn ISO 27001. Enterprise plan có thể yêu cầu triển khai on-premise.",
  },
  {
    id: "faq-3",
    question: "Tôi có thể dùng thử miễn phí không?",
    answer:
      "Có. Tất cả người dùng mới đều được dùng thử Growth plan đầy đủ tính năng trong 14 ngày mà không cần cung cấp thẻ tín dụng. Sau 14 ngày, bạn chọn gói phù hợp hoặc hệ thống tự chuyển về Starter plan miễn phí.",
  },
  {
    id: "faq-4",
    question: "Có hỗ trợ nhập dữ liệu từ hệ thống cũ không?",
    answer:
      "Có. Đội ngũ Customer Success của chúng tôi hỗ trợ migrate dữ liệu từ Excel, Google Sheets, hoặc các ATS khác (SAP SuccessFactors, Workday, Greenhouse). Thông thường quá trình này mất 1–3 ngày làm việc.",
  },
  {
    id: "faq-5",
    question: "AI sàng lọc hoạt động như thế nào?",
    answer:
      "AI của VietRecruit phân tích CV theo 12 tiêu chí từ Job Description của bạn, bao gồm: kinh nghiệm, kỹ năng kỹ thuật, soft skills, và cultural fit. Mô hình được fine-tune với dữ liệu tuyển dụng Việt Nam, đạt độ chính xác 94% so với đánh giá của HR senior. Bạn có thể điều chỉnh trọng số từng tiêu chí.",
  },
  {
    id: "faq-6",
    question: "Có hợp đồng dài hạn không?",
    answer:
      "Không. Tất cả các gói đều thanh toán theo tháng và có thể hủy bất kỳ lúc nào mà không mất phí phạt. Gói năm tiết kiệm 20% và thanh toán một lần. Enterprise plan có thể thương lượng điều khoản riêng.",
  },
];

const openId = ref<string | null>(null);

function toggle(id: string): void {
  openId.value = openId.value === id ? null : id;
}
</script>

<template>
  <section class="py-24 px-6 bg-surface" aria-label="Câu hỏi thường gặp">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-14">
        <span class="section-badge mb-4"> FAQ </span>
        <h2
          class="font-display text-4xl md:text-5xl text-text-primary font-bold"
        >
          Câu hỏi thường gặp
        </h2>
      </div>

      <!-- Accordion -->
      <div class="space-y-3" role="list">
        <div
          v-for="faq in faqs"
          :key="faq.id"
          class="bg-white border rounded-xl overflow-hidden transition-colors duration-200"
          :class="
            openId === faq.id
              ? 'border-brand/40 shadow-sm'
              : 'border-border hover:border-brand/30'
          "
          role="listitem"
        >
          <!-- Question button -->
          <button
            :id="`btn-${faq.id}`"
            type="button"
            :aria-expanded="openId === faq.id"
            :aria-controls="`panel-${faq.id}`"
            class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-muted transition-colors duration-200"
            @click="toggle(faq.id)"
          >
            <span class="text-text-primary text-sm font-medium">{{
              faq.question
            }}</span>
            <ChevronDown
              :size="16"
              :class="[
                'text-text-secondary flex-shrink-0 transition-transform duration-300',
                openId === faq.id ? 'rotate-180 text-brand' : '',
              ]"
              aria-hidden="true"
            />
          </button>

          <!-- Answer panel — CSS grid-rows trick for smooth height transition -->
          <div
            :id="`panel-${faq.id}`"
            role="region"
            :aria-labelledby="`btn-${faq.id}`"
            class="grid transition-all duration-300 ease-in-out"
            :style="{
              gridTemplateRows: openId === faq.id ? '1fr' : '0fr',
            }"
          >
            <div class="overflow-hidden">
              <p
                class="px-5 pb-5 pt-1 text-sm text-text-secondary leading-relaxed"
              >
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact CTA -->
      <p class="text-center text-text-secondary text-sm mt-10">
        Vẫn còn thắc mắc?
        <a
          href="mailto:hello@vietrecruit.vn"
          class="text-brand hover:text-brand-dark underline underline-offset-2 transition-colors"
        >
          Liên hệ với chúng tôi
        </a>
      </p>
    </div>
  </section>
</template>
