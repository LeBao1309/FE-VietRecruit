import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/store/AppContext";
import LoginPage from "@/components/LoginPage";
import LandingPage from "@/components/LandingPage";
import CandidatePortal from "@/components/candidate/CandidatePortal";
import RecruiterPortal from "@/components/recruiter/RecruiterPortal";
import BrowseJobs from "@/components/candidate/BrowseJobs";
import { useState, useEffect, useCallback } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { role, page, setPage } = useApp();
  const [transitioning, setTransitioning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Intercept navigation to login with transition
  const handleNavigateToLogin = useCallback(() => {
    setTransitioning(true);
    // After blur animation starts, slide in login
    setTimeout(() => setShowLogin(true), 150);
    // Complete transition
    setTimeout(() => setPage('login'), 600);
  }, [setPage]);

  // Reset transition state when page changes away from login
  useEffect(() => {
    if (page !== 'landing' && page !== 'login') {
      setTransitioning(false);
      setShowLogin(false);
    }
  }, [page]);

  // If already logged in
  if (role) {
    if (role === "candidate") return <CandidatePortal />;
    return <RecruiterPortal />;
  }

  // Login page (direct access, no transition)
  if (page === 'login' && !transitioning) return <LoginPage />;

  if (page === 'browse-jobs' || page === 'guest-browse') return <GuestBrowse />;

  // Landing page with transition overlay
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Landing page layer */}
      <div
        className={`transition-all duration-500 ease-out ${
          transitioning ? 'blur-md scale-[1.02] opacity-40' : ''
        }`}
      >
        <LandingPage onNavigateLogin={handleNavigateToLogin} />
      </div>

      {/* Login drawer overlay */}
      {transitioning && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-foreground/60 z-40 animate-fade-in" />
          
          {/* Auth drawer sliding in from right */}
          <div
            className={`fixed top-0 right-0 h-full w-full md:w-[440px] z-50 transition-transform duration-500 ease-out ${
              showLogin ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <LoginPage isDrawer onClose={() => { setTransitioning(false); setShowLogin(false); }} />
          </div>
        </>
      )}
    </div>
  );
};

const GuestBrowse = () => {
  const { setPage } = useApp();
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <nav className="h-14 glass border-b border-border sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-[10px] font-bold">VR</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">VietRecruit</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage('login')} className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              Login
            </button>
            <button onClick={() => setPage('login')} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <BrowseJobs />
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
