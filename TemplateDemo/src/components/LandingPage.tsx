import React, { useState, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import {
  Search, Zap, LayoutGrid, Server, ClipboardCheck, BarChart3,
  Shield, Globe, ArrowRight, Sparkles, ChevronRight, Play, Check
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin?: () => void;
}

const LandingPage = ({ onNavigateLogin }: LandingPageProps) => {
  const { setPage } = useApp();
  const goLogin = onNavigateLogin || (() => setPage('login'));
  const [typedText, setTypedText] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const fullPrompt = 'Find me a Senior Vue.js developer with Spring Boot experience...';

  // Typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullPrompt.length) {
        setTypedText(fullPrompt.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'Visual Kanban Board',
      description: 'Drag-and-drop candidates through your hiring pipeline. See every stage at a glance with real-time AI scoring.',
      icon: LayoutGrid,
      span: 'md:col-span-2',
      visual: 'kanban',
    },
    {
      title: 'Multi-tenant Architecture',
      description: 'Enterprise-grade isolation. Each team gets their own workspace with SSO and role-based access.',
      icon: Server,
      span: '',
      visual: 'server',
    },
    {
      title: 'Automated Scorecards',
      description: 'AI evaluates candidates against job requirements. Objective, consistent, bias-free scoring at scale.',
      icon: ClipboardCheck,
      span: '',
      visual: 'scores',
    },
    {
      title: 'Advanced Analytics',
      description: 'Track time-to-hire, source quality, and funnel conversion with real-time dashboards.',
      icon: BarChart3,
      span: 'md:col-span-2',
      visual: 'analytics',
    },
  ];

  const stats = [
    { value: '10x', label: 'Faster Screening' },
    { value: '92%', label: 'AI Match Accuracy' },
    { value: '<3s', label: 'Vector Search Speed' },
    { value: '50K+', label: 'Candidates Processed' },
  ];

  return (
    <div className="min-h-screen bg-foreground text-background overflow-x-hidden">
      {/* ═══════════════ Zone A: Transparent Navigation ═══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-foreground/80 border-b border-white/10' : ''
      }`}>
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold tracking-tight text-white">VietRecruit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs text-white/60 hover:text-white transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-xs text-white/60 hover:text-white transition-colors font-medium">Pricing</a>
            <a href="#stats" className="text-xs text-white/60 hover:text-white transition-colors font-medium">Results</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goLogin}
              className="text-xs text-white/70 hover:text-white transition-colors font-medium hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={goLogin}
              className="bg-primary hover:bg-marrs-dark text-white rounded-full px-5 py-2 text-xs font-medium transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════ Zone B: Hero Section (Dark) ═══════════════ */}
      <section className="min-h-screen relative flex items-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy & AI Demo */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Sparkles size={12} className="text-primary" />
                  <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Powered by HNSW Vector Search</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Hire the Top 1%.
                  <br />
                  <span className="text-primary">Let AI do the 99%.</span>
                </h1>
                <p className="text-base md:text-lg text-white/50 max-w-lg leading-relaxed">
                  VietRecruit uses HNSW Vector Search to find your perfect candidate in milliseconds. 
                  Not minutes. Not hours. <span className="text-white/70 font-medium">Milliseconds.</span>
                </p>
              </div>

              {/* AI Command Prompt */}
              <div className="relative">
                <div className="bg-white/[0.04] border border-white/10 backdrop-blur-md rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red/60" />
                    <div className="w-2 h-2 rounded-full bg-amber/60" />
                    <div className="w-2 h-2 rounded-full bg-emerald/60" />
                    <span className="text-[10px] text-white/30 ml-2 font-mono-num">ai-search.vietrecruit.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Search size={16} className="text-white/30 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white/70 font-mono-num">{typedText}</span>
                      <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/40 font-mono-num">semantic</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/40 font-mono-num">vector</span>
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-[9px] text-primary font-mono-num">HNSW</span>
                    </div>
                    <button className="bg-primary hover:bg-marrs-dark text-white rounded-lg px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20">
                      <Zap size={12} /> Search
                    </button>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-primary/5 rounded-2xl blur-xl -z-10" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={goLogin}
                  className="bg-primary hover:bg-marrs-dark text-white rounded-full px-7 py-3 text-sm font-medium transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
                >
                  Start Free Trial <ArrowRight size={14} />
                </button>
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors font-medium group">
                  <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                    <Play size={12} className="ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right: 3D Placeholder */}
            <div className="relative w-full h-[400px] lg:h-[500px] hidden lg:block">
              {/* @TresJS 3D Hiring Funnel Visualization will render here */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0,140,140,0.15), transparent 50%)'
                }}
              >
                {/* Decorative orbits */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border border-white/[0.04] animate-[spin_30s_linear_infinite]" />
                  <div className="absolute w-52 h-52 rounded-full border border-white/[0.06] animate-[spin_20s_linear_infinite_reverse]" />
                  <div className="absolute w-32 h-32 rounded-full border border-primary/20" />
                  {/* Central glow */}
                  <div className="absolute w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
                  <div className="absolute w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40" />
                </div>
                {/* Floating data points */}
                <div className="absolute top-1/4 left-1/4 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[9px] text-white/50 font-mono-num">92% match</span>
                </div>
                <div className="absolute top-1/3 right-1/4 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[9px] text-primary font-mono-num">Vue.js ✓</span>
                </div>
                <div className="absolute bottom-1/3 left-1/3 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[9px] text-white/50 font-mono-num">5yr exp</span>
                </div>
                <div className="absolute bottom-1/4 right-1/3 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-[9px] text-emerald font-mono-num">Available</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 font-medium tracking-wide uppercase">
                  TresJS 3D Hiring Funnel Visualization
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to light */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </section>

      {/* ═══════════════ Stats Bar ═══════════════ */}
      <section id="stats" className="bg-background py-16 px-6">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight font-mono-num">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ Zone C: Bento Grid Features ═══════════════ */}
      <section id="features" className="bg-background py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Built for Scale.
              <br />
              <span className="text-muted-foreground">Designed for Speed.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`bg-card border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300 group ${f.span}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <f.icon size={18} />
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight mb-2 text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{f.description}</p>

                {/* Visual representations */}
                {f.visual === 'kanban' && (
                  <div className="flex gap-2 mt-2">
                    {['New', 'Screening', 'Interview', 'Offer'].map((col, ci) => (
                      <div key={col} className="flex-1 bg-secondary rounded-lg p-2">
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">{col}</span>
                        <div className="mt-1.5 space-y-1">
                          {Array.from({ length: 3 - ci }).map((_, j) => (
                            <div key={j} className="h-6 bg-card border border-border rounded flex items-center px-1.5">
                              <div className="w-3 h-3 rounded-full bg-secondary mr-1" />
                              <div className="flex-1 h-1.5 bg-secondary rounded-full" />
                              <span className={`text-[7px] font-mono-num ml-1 ${ci === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                {90 - ci * 15 - j * 8}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {f.visual === 'server' && (
                  <div className="flex items-center gap-3 mt-2">
                    {['Team Alpha', 'Team Beta', 'Team Gamma'].map(t => (
                      <div key={t} className="flex-1 bg-secondary rounded-lg p-2 text-center">
                        <Server size={14} className="mx-auto text-muted-foreground mb-1" />
                        <span className="text-[8px] font-medium text-muted-foreground">{t}</span>
                        <div className="w-full h-0.5 bg-primary/30 rounded-full mt-1" />
                      </div>
                    ))}
                  </div>
                )}

                {f.visual === 'scores' && (
                  <div className="space-y-2 mt-2">
                    {[
                      { label: 'Technical', score: 92 },
                      { label: 'Communication', score: 78 },
                      { label: 'Culture Fit', score: 85 },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[9px] text-muted-foreground">{s.label}</span>
                          <span className="text-[9px] font-mono-num text-primary font-medium">{s.score}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {f.visual === 'analytics' && (
                  <div className="flex items-end gap-1.5 h-16 mt-2">
                    {[40, 55, 35, 70, 60, 85, 50, 90, 75, 65, 80, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          backgroundColor: i >= 10 ? 'hsl(var(--primary))' : `hsl(var(--primary) / ${0.15 + i * 0.06})`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Social Proof ═══════════════ */}
      <section className="bg-background py-16 px-6 border-t border-border">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-8">Trusted by leading companies in Southeast Asia</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['Vinova', 'FPT Software', 'VNG Corp', 'Tiki', 'MoMo', 'VNPay'].map(name => (
              <span key={name} className="text-sm font-semibold text-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Pricing Preview ═══════════════ */}
      <section id="pricing" className="bg-background py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-sm text-muted-foreground mt-2">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Starter', price: 'Free', desc: 'For small teams', features: ['Up to 3 jobs', '50 candidates/mo', 'Basic AI scoring', 'Email support'] },
              { name: 'Pro', price: '$49', desc: 'For growing teams', features: ['Unlimited jobs', '500 candidates/mo', 'Advanced AI + Vector Search', 'Kanban + Analytics', 'Priority support'], popular: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited everything', 'Multi-tenant SSO', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee'] },
            ].map(plan => (
              <div
                key={plan.name}
                className={`bg-card rounded-2xl p-6 border transition-all ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/10 relative' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-sm font-semibold">{plan.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{plan.desc}</p>
                <div className="my-4">
                  <span className="text-3xl font-bold font-mono-num tracking-tight">{plan.price}</span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && <span className="text-xs text-muted-foreground">/mo</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check size={12} className="text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={goLogin}
                  className={`w-full py-2.5 rounded-lg text-xs font-medium transition-all ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-marrs-dark'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Final CTA ═══════════════ */}
      <section className="bg-foreground py-24 px-6 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0,140,140,0.15), transparent 60%)' }} />
        <div className="max-w-[600px] mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to hire smarter?
          </h2>
          <p className="text-sm text-white/50 mb-8">Join 500+ companies already using VietRecruit to find exceptional talent.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={goLogin}
              className="bg-primary hover:bg-marrs-dark text-white rounded-full px-8 py-3 text-sm font-medium transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
            >
              Start Free Trial <ArrowRight size={14} />
            </button>
            <button
              onClick={goLogin}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Book a Demo →
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="bg-foreground border-t border-white/5 py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-white/80">VietRecruit</span>
          </div>
          <p className="text-[10px] text-white/30">© 2026 VietRecruit. Built with ❤️ in Vietnam.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
