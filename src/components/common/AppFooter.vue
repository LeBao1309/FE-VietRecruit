<template>
  <footer class="bg-white text-slate-500 border-t-2 border-slate-200">

    <!-- Main grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">

        <!-- Brand column -->
        <div class="md:col-span-3">
          <div class="flex items-center gap-2.5 mb-4">
            <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-8 w-8" />
            <span class="text-xl font-extrabold text-[#007070] tracking-tight">VietRecruit</span>
          </div>
          <p class="text-sm leading-relaxed mb-6 max-w-xs text-slate-500">
            Modern AI-powered recruitment platform built for teams that move fast. From job posting to signed offer — all in one place.
          </p>

          <!-- Social links -->
          <div class="flex items-center gap-3">
            <a href="#" aria-label="Twitter" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-[#008c8c] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-[#008c8c] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zm-11 19H5v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765C13.396 6.979 19 6.788 19 12.241V19z"/>
              </svg>
            </a>
            <a href="#" aria-label="GitHub" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-[#008c8c] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Product links -->
        <div class="md:col-span-2">
          <h4 class="text-slate-900 text-xs font-bold uppercase tracking-wider mb-4">Product</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="#features" class="hover:text-[#008c8c] transition-colors">Features</a></li>
            <li><a href="#pricing" class="hover:text-[#008c8c] transition-colors">Pricing</a></li>
            <li><a href="#demo" class="hover:text-[#008c8c] transition-colors">Demo</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Changelog</a></li>
          </ul>
        </div>

        <!-- Resources links -->
        <div class="md:col-span-2">
          <h4 class="text-slate-900 text-xs font-bold uppercase tracking-wider mb-4">Resources</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Documentation</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">API Reference</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Support</a></li>
          </ul>
        </div>

        <!-- Legal links -->
        <div class="md:col-span-2">
          <h4 class="text-slate-900 text-xs font-bold uppercase tracking-wider mb-4">Legal</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Terms of Service</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Cookie Policy</a></li>
            <li><a href="#" class="hover:text-[#008c8c] transition-colors">Security</a></li>
          </ul>
        </div>

        <!-- Team column -->
        <div class="md:col-span-3">
          <h4 class="text-slate-900 text-xs font-bold uppercase tracking-wider mb-4">Team 4F</h4>
          <ul class="space-y-2.5 text-sm">
            <li class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[9px] font-bold shrink-0">PK</span>
              <span class="whitespace-nowrap">Phan Hoang Anh Khoa</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[9px] font-bold shrink-0">QM</span>
              <span class="whitespace-nowrap">Nguyen Quang Minh</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[9px] font-bold shrink-0">GB</span>
              <span class="whitespace-nowrap">Le Quang Gia Bao</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold shrink-0">QV</span>
              <span class="whitespace-nowrap">Nguyen Thanh Quoc Vinh</span>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>&copy; 2026 VietRecruit · Built by Team 4F</p>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span>All systems operational</span>
        </div>
      </div>
    </div>

  </footer>
</template>
