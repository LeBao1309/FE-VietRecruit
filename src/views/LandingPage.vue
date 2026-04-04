<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import MiniStepper from '@/components/candidate/MiniStepper.vue'
import { planService } from '@/services/subscriptionService'
import type { PlanResponse } from '@/types/subscription'

const isAnnual = ref(true)
const auth = useAuthStore()

const rawPlans = ref<PlanResponse[]>([])

function deriveFeatures(plan: PlanResponse): string[] {
  const features: string[] = []
  if (plan.maxActiveJobs === 0 || plan.maxActiveJobs < 0) {
    features.push('Unlimited active jobs')
  } else {
    features.push(`Up to ${plan.maxActiveJobs} active job${plan.maxActiveJobs === 1 ? '' : 's'}`)
  }
  if (plan.resumeAccess) features.push('Resume access')
  if (plan.aiMatching) features.push('AI Matching')
  if (plan.priorityListing) features.push('Priority listing')
  return features
}

function deriveButtonText(code: string): string {
  const c = code.toUpperCase()
  if (c.includes('FREE')) return 'Get Started Free'
  if (c.includes('ENTERPRISE')) return 'Contact Sales'
  return 'Start Trial'
}

const plans = computed(() =>
  rawPlans.value.map(plan => ({
    id: plan.id,
    name: plan.name,
    desc: plan.description ?? '',
    priceMonthly: plan.priceMonthly,
    priceAnnual: Math.round(plan.priceYearly / 12),
    features: deriveFeatures(plan),
    buttonText: deriveButtonText(plan.code),
    isPopular: plan.code.toUpperCase().includes('PRO'),
  }))
)

onMounted(async () => {
  const result = await planService.listPlans()
  if (result.data) rawPlans.value = result.data
})
</script>

<template>
 <div class="min-h-screen flex flex-col font-sans bg-white selection:bg-teal-100 selection:text-teal-900">
 <!-- Navbar -->
 <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
 <div class="flex items-center gap-2">
 <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit Logo" class="h-8 w-8" />
 <span class="text-2xl font-bold text-[#008c8c] tracking-tight">VietRecruit</span>
 </div>
 <nav class="hidden md:flex items-center gap-8">
 <a href="#features" class="text-sm font-medium text-slate-600 hover:text-[#008c8c] transition-colors">Features</a>
 <a href="#demo" class="text-sm font-medium text-slate-600 hover:text-[#008c8c] transition-colors">Product</a>
 <a href="#pricing" class="text-sm font-medium text-slate-600 hover:text-[#008c8c] transition-colors">Pricing</a>
 </nav>
 <div class="flex items-center gap-4">
 <template v-if="!auth.isAuthenticated">
 <router-link to="/login" class="text-sm font-bold text-slate-700 hover:text-[#008c8c] transition-colors">Log In</router-link>
 <router-link to="/register" class="btn-primary px-5 py-2 hover:shadow-lg transition-all rounded-full">Get Started</router-link>
 </template>
 <template v-else>
 <span class="text-sm font-bold text-slate-700">{{ auth.user?.fullName }}</span>
 </template>
 </div>
 </div>
 </header>

 <!-- 1. Hero Section -->
 <section class="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
 <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold mb-8 animate-fade-in">
 <span class="flex h-2 w-2 rounded-full bg-teal-500"></span>
 VietRecruit 2.0 is now live
 </div>
 <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
 Recruit the best talent, <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#008c8c] to-teal-400">faster & smarter.</span>
 </h1>
 <p class="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
 The all-in-one AI-powered Applicant Tracking System built for modern teams. Streamline your hiring from job posting to offer letter.
 </p>
 <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
 <router-link to="/register" class="btn-primary text-lg px-8 py-4 rounded-full w-full sm:w-auto shadow-xl shadow-teal-500/20 hover:-translate-y-1">
 Start for free
 </router-link>
 <router-link to="/jobs" class="btn-secondary text-lg px-8 py-4 rounded-full w-full sm:w-auto border border-slate-200">
 Browse open jobs
 </router-link>
 </div>
 </section>

 <!-- 2. App Demo Section -->
 <section id="demo" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
   <!-- Section heading -->
   <div class="text-center mb-12">
     <div class="inline-flex items-center gap-2 bg-[#e0f4f4] text-[#007070] text-xs font-bold px-3 py-1 rounded-full mb-4">
       <span class="w-1.5 h-1.5 rounded-full bg-[#008c8c] animate-pulse"></span>
       See it in action
     </div>
     <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
       One platform for <span class="bg-gradient-to-r from-[#008c8c] to-teal-400 bg-clip-text text-transparent">every</span> hiring role
     </h2>
     <p class="text-slate-500 text-base max-w-xl mx-auto">
       From AI-powered candidate scoring to real-time pipeline tracking — VietRecruit keeps your whole team in sync.
     </p>
   </div>

   <!-- Bento grid -->
   <div class="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3.5">

     <!-- Hidden SVG defs for score ring gradient -->
     <svg width="0" height="0" class="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#008c8c"/>
          <stop offset="100%" stop-color="#2dd4bf"/>
        </linearGradient>
      </defs>
    </svg>

     <!-- ① AI Scoring — col 1, rows 1–2 -->
     <div class="relative md:row-span-2 bg-gradient-to-b from-[#f0fafa] to-[#e8f8f8] border border-[#b2e0e0] rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-[#008c8c]/40 transition-all">
      <div class="ai-dot-grid"></div>

      <!-- Tag -->
      <span class="inline-flex items-center gap-1.5 bg-[#c4ecec] text-[#007070] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md mb-4">
        ✦ AI Scoring
      </span>

      <!-- Score ring + subject -->
      <div class="flex items-center gap-4 mb-5">
        <!-- Ring -->
        <div class="relative w-[88px] h-[88px] shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" class="-rotate-90">
            <circle class="score-ring-bg" cx="44" cy="44" r="36"/>
            <circle class="score-ring-fill" cx="44" cy="44" r="36"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[22px] font-extrabold text-slate-900 leading-none">87</span>
            <span class="text-[8px] text-slate-400 font-semibold mt-0.5">/ 100</span>
          </div>
        </div>
        <!-- Meta -->
        <div>
          <div class="text-sm font-bold text-slate-900 mb-0.5">Nguyen Van A</div>
          <div class="text-[10px] text-slate-500 leading-snug mb-2">Senior Frontend Eng<br>TechCorp Vietnam</div>
          <span class="inline-flex items-center gap-1 bg-[#e0f4f4] border border-[#b2e0e0] text-[#007070] text-[9px] font-bold px-2 py-0.5 rounded">✦ AI Matched</span>
        </div>
      </div>

      <!-- Score bars -->
      <div class="space-y-2.5 mb-5">
        <div v-for="bar in [
          { label: 'Technical Skills', value: 9,  max: 10,  pct: '90%' },
          { label: 'Attitude',         value: 8,  max: 10,  pct: '80%' },
          { label: 'English',          value: 7,  max: 10,  pct: '70%' },
          { label: 'CV Match',         value: 92, max: 100, pct: '92%', suffix: '%' },
        ]" :key="bar.label">
          <div class="flex justify-between mb-1">
            <span class="text-[10px] text-slate-500 font-semibold">{{ bar.label }}</span>
            <span class="text-[10px] font-extrabold text-[#008c8c]">{{ bar.value }}{{ bar.suffix ?? `/${bar.max}` }}</span>
          </div>
          <div class="h-1.5 bg-[#d1eeee] rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-[#008c8c] to-teal-400" :style="{ width: bar.pct }"></div>
          </div>
        </div>
      </div>

      <!-- Candidate ranking list -->
      <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2">3 candidates analyzed</div>
      <div class="space-y-2">
        <div v-for="cand in [
          { initials: 'NA', name: 'Nguyen Van A', role: 'Frontend Engineer',  pct: '87%', bg: 'bg-[#e0f4f4]', color: 'text-[#008c8c]' },
          { initials: 'TL', name: 'Tran Le B',    role: 'Full Stack Dev',     pct: '74%', bg: 'bg-violet-100',  color: 'text-violet-600' },
          { initials: 'PD', name: 'Pham Duc C',   role: 'Vue.js Specialist',  pct: '61%', bg: 'bg-sky-100',     color: 'text-sky-600' },
        ]" :key="cand.initials"
          class="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-xl hover:border-[#008c8c]/30 transition-colors">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0" :class="[cand.bg, cand.color]">
            {{ cand.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[11px] font-semibold text-slate-800 truncate">{{ cand.name }}</div>
            <div class="text-[9px] text-slate-400">{{ cand.role }}</div>
          </div>
          <div class="text-xs font-extrabold shrink-0" :class="cand.color">{{ cand.pct }}</div>
        </div>
      </div>
     </div>

    <!-- ② Job Board — cols 2–3, row 1 -->
    <div class="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#008c8c]/30 transition-all">
      <span class="inline-flex items-center gap-1.5 bg-[#e0f4f4] text-[#008c8c] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3">
        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Job Board
      </span>

      <!-- Mock search bar -->
      <div class="flex items-stretch bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-4">
        <div class="flex items-center gap-2 flex-1 px-3 py-2.5 border-r border-slate-200">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span class="text-[11px] text-slate-400">Job title, skill, keyword…</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200">
          <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          <span class="text-[11px] text-slate-400">Ho Chi Minh City</span>
        </div>
        <div class="flex items-center px-3 py-2.5 bg-[#008c8c] text-white text-[10px] font-bold cursor-default">
          Search Jobs
        </div>
      </div>

      <!-- Job chips -->
      <div class="flex flex-wrap gap-2">
        <div v-for="job in [
          { title: 'Senior Frontend Engineer', salary: '$3k–5k',    loc: 'HCMC',   color: '#008c8c' },
          { title: 'Product Manager',          salary: 'Negotiable', loc: 'Remote', color: '#2dd4bf' },
          { title: 'Data Engineer',            salary: '$2.5k–4k',  loc: 'Hanoi',  color: '#6366f1' },
          { title: 'UX / UI Designer',         salary: '$2k–3.5k',  loc: 'HCMC',   color: '#f59e0b' },
        ]" :key="job.title"
          class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-600 hover:border-[#008c8c]/40 transition-colors">
          <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: job.color }"></span>
          {{ job.title }}
          <span class="font-bold ml-0.5" style="color: #008c8c">{{ job.salary }}</span>
          <span class="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded">{{ job.loc }}</span>
        </div>
        <router-link to="/jobs" class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400 italic hover:border-[#008c8c]/30 transition-colors">
          +338 open roles →
        </router-link>
      </div>
    </div>

    <!-- ③ ④ cells added in Tasks 4–5 -->

   </div>
 </section>

 <!-- 3. Features Highlights -->
 <section id="features" class="py-24 bg-slate-50 relative border-t border-slate-200/50">
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div class="text-center mb-16">
 <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to scale your team</h2>
 <p class="text-lg text-slate-500 max-w-2xl mx-auto">Powerful tools designed to reduce time-to-hire and improve candidate experience.</p>
 </div>
 
 <div class="grid md:grid-cols-3 gap-8">
 <!-- Feat 1 -->
 <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
 <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 text-[#008c8c]">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
 </div>
 <h3 class="text-xl font-bold text-slate-900 mb-3">AI-Powered Tools</h3>
 <p class="text-slate-500 leading-relaxed">Instantly generate Job Descriptions, interview questions, and assess CVs using generative AI.</p>
 </div>
 <!-- Feat 2 -->
 <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
 <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 text-[#008c8c]">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
 </div>
 <h3 class="text-xl font-bold text-slate-900 mb-3">Collaborative Pipeline</h3>
 <p class="text-slate-500 leading-relaxed">Keep your entire hiring team in sync with real-time scorecards, interview tracking, and notifications.</p>
 </div>
 <!-- Feat 3 -->
 <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
 <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 text-[#008c8c]">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
 </div>
 <h3 class="text-xl font-bold text-slate-900 mb-3">Offer Management</h3>
 <p class="text-slate-500 leading-relaxed">Easily send secure digital offer letters and let candidates accept or decline with one click.</p>
 </div>
 </div>
 </div>
 </section>

 <!-- 4. Pricing / Subscription -->
 <section id="pricing" class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
 <div class="text-center mb-16">
 <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
 <p class="text-lg text-slate-500 max-w-2xl mx-auto mb-8">Choose the plan that fits your growing organization.</p>
 
 <div class="inline-flex items-center bg-slate-100 p-1 rounded-xl">
 <button @click="isAnnual = false" :class="!isAnnual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'" class="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all">Monthly</button>
 <button @click="isAnnual = true" :class="isAnnual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'" class="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all">
 Annually <span class="text-[#008c8c] text-xs ml-1">-20%</span>
 </button>
 </div>
 </div>

 <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
 <div v-for="plan in plans" :key="plan.name" 
 class="relative bg-white rounded-3xl p-8 border"
 :class="plan.isPopular ? 'border-[#008c8c] shadow-2xl scale-100 md:scale-105 z-10' : 'border-slate-200 shadow-sm'">
 
 <div v-if="plan.isPopular" class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#008c8c] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
 Most Popular
 </div>

 <h3 class="text-2xl font-bold text-slate-900 mb-2">{{ plan.name }}</h3>
 <p class="text-slate-500 text-sm mb-6 h-10">{{ plan.desc }}</p>
 
 <div class="mb-8 flex items-baseline gap-1">
 <span class="text-4xl font-extrabold text-slate-900">${{ isAnnual ? plan.priceAnnual : plan.priceMonthly }}</span>
 <span class="text-slate-500 font-medium">/mo</span>
 </div>

 <ul class="space-y-4 mb-8">
 <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3 text-slate-600 text-sm font-medium">
 <svg class="w-5 h-5 text-[#008c8c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
 {{ feature }}
 </li>
 </ul>

 <router-link to="/register" 
 class="block w-full py-3.5 px-4 rounded-xl text-center font-bold transition-all"
 :class="plan.isPopular ? 'bg-[#008c8c] hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'">
 {{ plan.buttonText }}
 </router-link>
 </div>
 </div>
 </section>

 <!-- 5. Footer -->
 <footer class="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
 <div class="col-span-1 md:col-span-1">
 <div class="flex items-center gap-2 mb-6">
 <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit Logo" class="h-8 w-8 brightness-0 invert" />
 <span class="text-2xl font-bold text-white tracking-tight">VietRecruit</span>
 </div>
 <p class="text-sm text-slate-400 mb-6">
 Building the next generation of modern hiring tools for ambitious companies globally.
 </p>
 <div class="flex items-center gap-4 text-slate-400">
 <a href="#" class="hover:text-white transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
 <a href="#" class="hover:text-white transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
 </div>
 </div>
 
 <div class="col-span-1">
 <h4 class="text-white font-bold mb-4 uppercase tracking-wider text-xs">Product</h4>
 <ul class="space-y-3 text-sm">
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Features</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Pricing</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Security</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Changelog</a></li>
 </ul>
 </div>

 <div class="col-span-1">
 <h4 class="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
 <ul class="space-y-3 text-sm">
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">About</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Careers</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Blog</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Contact</a></li>
 </ul>
 </div>

 <div class="col-span-1">
 <h4 class="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
 <ul class="space-y-3 text-sm">
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Privacy Policy</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Terms of Service</a></li>
 <li><a href="#" class="hover:text-[#008c8c] transition-colors">Cookie Policy</a></li>
 </ul>
 </div>
 </div>
 
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
 <p>&copy; 2026 VietRecruit, Inc. All rights reserved.</p>
 <div class="flex items-center gap-2">
 <span class="w-2 h-2 rounded-full bg-teal-500"></span>
 All systems operational
 </div>
 </div>
 </footer>
 </div>
</template>

<style scoped>
/* Score ring SVG gradient */
.score-ring-fill {
  fill: none;
  stroke: url(#scoreGrad);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 226;
  stroke-dashoffset: 38;
}
.score-ring-bg {
  fill: none;
  stroke: #d1eeee;
  stroke-width: 8;
}
/* Dot-grid pattern for AI cell */
.ai-dot-grid {
  position: absolute;
  inset: 0;
  opacity: 0.07;
  background-image: radial-gradient(circle, #008c8c 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  border-radius: inherit;
}
</style>
