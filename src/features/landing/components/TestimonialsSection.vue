<script setup lang="ts">
interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "VietRecruit giúp chúng tôi giảm 70% thời gian sàng lọc CV. Tính năng AI thực sự ấn tượng, chính xác đến mức tôi không nghĩ là có thể ở một sản phẩm Việt Nam.",
    name: "Nguyễn Thị Lan",
    title: "HR Director",
    company: "Techcombank",
    initials: "NL",
    gradient: "from-brand to-teal-400",
  },
  {
    id: "t2",
    quote:
      "Giao diện trực quan, team HR của chúng tôi không cần training mà vẫn dùng được ngay. Pipeline Kanban giúp toàn team đồng bộ thông tin ứng viên realtime.",
    name: "Trần Minh Đức",
    title: "Talent Acquisition Lead",
    company: "VNG",
    initials: "TD",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    id: "t3",
    quote:
      "Báo cáo analytics giúp tôi present với Board rõ ràng hơn nhiều so với Excel. Mình thấy đây là bước đột phá lớn cho HR Việt Nam.",
    name: "Phạm Thu Hương",
    title: "CHRO",
    company: "Masan Group",
    initials: "PH",
    gradient: "from-orange-400 to-yellow-300",
  },
];
</script>

<template>
  <!--
    Section background: bg-surface-muted (#F1F5F5) — slightly off-white,
    creates visual separation from adjacent white sections.
    Cards: bg-white with shadow-sm. Hover: shadow-md + border-brand/10.
  -->
  <section class="py-24 bg-surface-muted">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="section-badge mx-auto mb-4">Khách hàng nói gì</div>
        <h2
          class="font-display text-3xl md:text-5xl font-bold text-text-primary"
        >
          Được tin dùng bởi các doanh nghiệp<br />
          <span class="text-brand italic">hàng đầu Việt Nam</span>
        </h2>
      </div>

      <!-- Cards grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="bg-white rounded-2xl p-6 border border-border transition-all duration-200 hover:shadow-hover hover:border-brand/15"
          style="box-shadow: 0 1px 3px rgba(0, 100, 100, 0.06)"
        >
          <!-- Stars -->
          <div class="flex gap-1 mb-4">
            <span v-for="s in 5" :key="s" class="text-amber-400 text-sm"
              >★</span
            >
          </div>

          <!-- Quote text -->
          <blockquote
            class="text-text-secondary text-sm leading-relaxed italic mb-6"
          >
            "{{ t.quote }}"
          </blockquote>

          <!-- Author -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex-shrink-0"
              :style="`background: linear-gradient(135deg, #009898, #005F5F)`"
            />
            <div>
              <div class="text-sm font-semibold text-text-primary">
                {{ t.name }}
              </div>
              <div class="text-xs text-text-muted">
                {{ t.title }}, {{ t.company }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
