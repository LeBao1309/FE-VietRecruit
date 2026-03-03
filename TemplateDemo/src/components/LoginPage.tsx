import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Role } from '@/types';
import { Eye, EyeOff, User, Building2, Loader2, Github, Linkedin, Search, Sparkles, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LATENCY, simulateLatency } from '@/lib/uiHelpers';

type AuthMode = 'login' | 'register';

interface LoginPageProps {
  isDrawer?: boolean;
  onClose?: () => void;
}

const LoginPage = ({ isDrawer, onClose }: LoginPageProps) => {
  const { login, updateProfile, profile, updateCompanyInfo } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await simulateLatency(LATENCY.LOGIN);
    login(selectedRole);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setShakeBtn(true); setTimeout(() => setShakeBtn(false), 500);
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setShakeBtn(true); setTimeout(() => setShakeBtn(false), 500);
      toast({ title: 'Invalid email', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      setShakeBtn(true); setTimeout(() => setShakeBtn(false), 500);
      toast({ title: 'Weak password', description: 'Min 6 characters.', variant: 'destructive' });
      return;
    }
    if (selectedRole === 'recruiter' && !companyName.trim()) {
      setShakeBtn(true); setTimeout(() => setShakeBtn(false), 500);
      toast({ title: 'Company required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    await simulateLatency(LATENCY.LOGIN);
    if (selectedRole === 'candidate') {
      updateProfile({ ...profile, name: fullName.trim(), email: email.trim() });
    } else {
      updateCompanyInfo({ name: companyName.trim(), website: '', logoUrl: '', about: '' });
    }
    login(selectedRole);
    toast({ title: `Welcome, ${fullName.trim()}!` });
    setLoading(false);
  };

  const switchMode = (mode: AuthMode) => { setAuthMode(mode); setShakeBtn(false); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (authMode === 'login') handleLogin(e as any);
      else handleRegister(e as any);
    }
  };

  /* ── Ghost Input ── */
  const ghostInputClass = "w-full bg-transparent ring-1 ring-border focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_0_12px_hsl(var(--primary)/0.08)] rounded-lg py-2.5 px-3 text-sm transition-all duration-300 outline-none placeholder:text-muted-foreground";

  const authPanel = (
    <>
      {/* Close button */}
      {isDrawer && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors z-10"
        >
          <X size={16} />
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_2px_8px_hsl(var(--primary)/0.3)]">
          <span className="text-primary-foreground text-[10px] font-bold tracking-tight">VR</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">VietRecruit</span>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold tracking-tight text-foreground mt-10">
        {authMode === 'login' ? 'Unlock your Match Results' : 'Create your Account'}
      </h2>
      <p className="text-sm text-muted-foreground mt-2">
        {authMode === 'login' ? 'Sign in to access your AI-powered workspace.' : 'Join VietRecruit to start hiring smarter.'}
      </p>

      {/* Role Toggle — Segmented Control */}
      <div className="flex rounded-lg bg-secondary/50 p-1 mt-8 border border-border/50">
        <button
          onClick={() => setSelectedRole('candidate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
            selectedRole === 'candidate'
              ? 'bg-card shadow-sm text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User size={14} /> Job Seeker
        </button>
        <button
          onClick={() => setSelectedRole('recruiter')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
            selectedRole === 'recruiter'
              ? 'bg-card shadow-sm text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 size={14} /> Recruiter
        </button>
      </div>

      {/* Social Login */}
      <div className="flex gap-3 mt-8">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-transparent border border-border hover:bg-secondary text-sm font-medium text-foreground transition-all">
          <Github size={15} /> GitHub
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-transparent border border-border hover:bg-secondary text-sm font-medium text-foreground transition-all">
          <Linkedin size={15} /> LinkedIn
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-[1px] bg-border" />
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">or continue with email</span>
        <div className="flex-1 h-[1px] bg-border" />
      </div>

      {/* Forms */}
      {authMode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={ghostInputClass} />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} className={`${ghostInputClass} pr-10`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-marrs-dark text-primary-foreground font-medium text-sm py-2.5 rounded-lg transition-all shadow-[0_4px_14px_0_hsl(var(--primary)/0.2)] hover:shadow-[0_6px_20px_hsl(var(--primary)/0.23)] hover:-translate-y-[1px] mt-6 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Full Name</label>
            <input placeholder="Nguyễn Văn Anh" value={fullName} onChange={e => setFullName(e.target.value)} onKeyDown={handleKeyDown} className={ghostInputClass} />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={ghostInputClass} />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} className={`${ghostInputClass} pr-10`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {selectedRole === 'recruiter' && (
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block">Company</label>
              <input placeholder="TechViet Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={handleKeyDown} className={ghostInputClass} />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary hover:bg-marrs-dark text-primary-foreground font-medium text-sm py-2.5 rounded-lg transition-all shadow-[0_4px_14px_0_hsl(var(--primary)/0.2)] hover:shadow-[0_6px_20px_hsl(var(--primary)/0.23)] hover:-translate-y-[1px] mt-6 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none ${shakeBtn ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Account →'}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground mt-6">
        {authMode === 'login' ? (
          <>No account?{' '}<span onClick={() => switchMode('register')} className="text-primary cursor-pointer hover:underline font-medium">Register →</span></>
        ) : (
          <>Have an account?{' '}<span onClick={() => switchMode('login')} className="text-primary cursor-pointer hover:underline font-medium">Login →</span></>
        )}
      </p>
    </>
  );

  // Drawer mode
  if (isDrawer) {
    return (
      <div className="h-full w-full bg-card/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l border-border/50 flex flex-col relative">
        <div className="flex-1 flex flex-col justify-center p-10 overflow-y-auto relative">
          {authPanel}
        </div>
      </div>
    );
  }

  // Standalone mode: full 3-layer layout
  return (
    <div className="h-screen w-full overflow-hidden relative bg-foreground">
      {/* Layer 1: Public Hero */}
      <div className="absolute inset-0 bg-foreground text-background p-8 md:p-12 transition-all opacity-50 blur-[2px]">
        <div className="max-w-2xl mt-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Hire the Top 1%.<br />
            <span className="text-primary">Let AI do the 99%.</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">
            VietRecruit uses HNSW Vector Search to find your perfect candidate in milliseconds.
          </p>
          <div className="relative max-w-lg">
            <div className="bg-background/5 border border-background/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
              <Search size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground text-sm">Find me a Senior Vue.js developer with Spring Boot experience...</span>
              <button className="ml-auto flex-shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <Sparkles size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-20 right-12 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* Layer 3: Workspace Kanban peek */}
      <div className="absolute inset-y-4 left-4 right-[456px] bg-background rounded-2xl shadow-inner border border-border z-40 transform scale-[0.97] opacity-80 overflow-hidden hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-[10px] font-bold">VR</span>
            </div>
            <span className="text-foreground text-sm font-semibold tracking-tight">VietRecruit Workspace</span>
          </div>
          <div className="flex gap-4">
            <div className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">New</span>
                <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">3</span>
              </div>
              <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-[0_0_16px_hsl(var(--primary)/0.15)] mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground">Trần Minh Khôi</span>
                  <span className="text-[10px] text-muted-foreground">2d ago</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                  <Sparkles size={10} /> 92% AI Match
                </span>
                <p className="text-[10px] text-muted-foreground mt-2">Vue.js · Spring Boot · PostgreSQL</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 opacity-50 mb-3">
                <div className="h-3 w-28 bg-secondary rounded mb-2" />
                <div className="h-2 w-20 bg-secondary rounded" />
              </div>
              <div className="bg-card border border-border rounded-lg p-4 opacity-30">
                <div className="h-3 w-24 bg-secondary rounded mb-2" />
                <div className="h-2 w-16 bg-secondary rounded" />
              </div>
            </div>
            <div className="w-64 flex-shrink-0 opacity-40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Screening</span>
                <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">1</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="h-3 w-32 bg-secondary rounded mb-2" />
                <div className="h-2 w-20 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: Auth Drawer — Glassmorphism */}
      <div className="absolute top-0 right-0 h-full w-full md:w-[440px] bg-card/80 backdrop-blur-2xl border-l border-border/50 shadow-[0_0_40px_rgba(0,0,0,0.05)] z-50 flex flex-col animate-slide-in-right">
        <div className="flex-1 flex flex-col justify-center p-10 overflow-y-auto">
          {authPanel}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
