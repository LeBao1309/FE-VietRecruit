<script setup lang="ts">
import { RouterLink } from "vue-router";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Tính năng", href: "#features" },
      { label: "Bảng giá", href: "#pricing" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Công ty",
    links: [
      { label: "Về chúng tôi", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Tuyển dụng", href: "#" },
      { label: "Báo chí", href: "#" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "#" },
      { label: "API Docs", href: "#" },
      { label: "Status", href: "#" },
      { label: "Liên hệ", href: "#" },
    ],
  },
];
</script>

<template>
  <footer
    class="bg-surface-soft border-t border-border pt-14 pb-8 px-6"
    role="contentinfo"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Top Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
        <!-- Brand Column -->
        <div class="col-span-2 md:col-span-1 space-y-4">
          <RouterLink
            to="/"
            class="flex items-center gap-2.5 group w-fit"
            aria-label="VietRecruit Home"
          >
            <img
              src="@/assets/img/vietrecruit-icon.svg"
              alt="VietRecruit"
              class="h-8 w-auto"
              loading="lazy"
            />
            <span
              class="font-semibold text-text-primary group-hover:text-brand transition-colors"
            >
              VietRecruit
            </span>
          </RouterLink>
          <p class="text-sm text-text-secondary leading-relaxed max-w-[220px]">
            Nền tảng ATS AI hàng đầu dành cho doanh nghiệp Việt Nam.
          </p>
          <!-- Social Icons -->
          <div class="flex items-center gap-3">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg bg-surface border border-border hover:border-brand/30 hover:bg-brand-light flex items-center justify-center text-text-secondary hover:text-brand transition-all duration-200"
              aria-label="LinkedIn VietRecruit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg bg-surface border border-border hover:border-brand/30 hover:bg-brand-light flex items-center justify-center text-text-secondary hover:text-brand transition-all duration-200"
              aria-label="Facebook VietRecruit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg bg-surface border border-border hover:border-brand/30 hover:bg-brand-light flex items-center justify-center text-text-secondary hover:text-brand transition-all duration-200"
              aria-label="Twitter VietRecruit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Link Columns -->
        <div v-for="col in columns" :key="col.title" class="space-y-4">
          <h3
            class="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary"
          >
            {{ col.title }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in col.links" :key="link.label">
              <a
                :href="link.href"
                class="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs text-text-secondary">
          © 2025 VietRecruit. Made with
          <span class="text-danger" aria-label="tình yêu">♥</span> in Vietnam
        </p>
        <div class="flex items-center gap-5">
          <a
            href="#"
            class="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >Chính sách bảo mật</a
          >
          <a
            href="#"
            class="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >Điều khoản dịch vụ</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
