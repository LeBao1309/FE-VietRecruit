<script setup lang="ts">
import { ref } from 'vue'

const isAnnual = ref(true)

const plans = [
 {
 name: 'Free',
 desc: 'Perfect for startups hiring their first roles.',
 priceMonthly: 0,
 priceAnnual: 0,
 features: ['Up to 1 active job', 'Basic application tracking', 'Community support'],
 buttonText: 'Get Started Free',
 isPopular: false
 },
 {
 name: 'Pro',
 desc: 'Advanced tools for growing recruitment teams.',
 priceMonthly: 49,
 priceAnnual: 39,
 features: ['Up to 10 active jobs', 'AI Salary Benchmarks', 'Collaborative interviewing', 'Priority email support'],
 buttonText: 'Start Pro Trial',
 isPopular: true
 },
 {
 name: 'Enterprise',
 desc: 'Unlimited power for large organizations.',
 priceMonthly: 199,
 priceAnnual: 149,
 features: ['Unlimited active jobs', 'AI JD Generation', 'Advanced analytics', 'Dedicated account manager'],
 buttonText: 'Contact Sales',
 isPopular: false
 }
]
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
 <router-link to="/login" class="text-sm font-bold text-slate-700 hover:text-[#008c8c] transition-colors">Log In</router-link>
 <router-link to="/register" class="btn-primary px-5 py-2 hover:shadow-lg transition-all rounded-full">Get Started</router-link>
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
 <section id="demo" class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
 <div class="relative rounded-2xl md:rounded-[2rem] p-4 md:p-8 bg-slate-50 border border-slate-200/60 shadow-2xl overflow-hidden group">
 <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-blue-500/5 opacity-50"></div>
 <img src="/assets/img/vietrecruit-banner.svg" alt="VietRecruit Dashboard Preview" class="relative z-10 w-full h-auto rounded-xl md:rounded-2xl border border-slate-200 shadow-sm transition-transform duration-700 group-hover:scale-[1.01]" />
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
