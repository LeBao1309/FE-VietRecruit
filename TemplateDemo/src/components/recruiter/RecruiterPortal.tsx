import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import KanbanBoard from './KanbanBoard';
import CandidateTableView from './CandidateTableView';
import RecruiterDashboard from './RecruiterDashboard';
import JobManagementList from './JobManagementList';
import TalentPool from './TalentPool';
import CommandPalette from './CommandPalette';
import CopilotChatPanel from './CopilotChatPanel';
import NotificationPopover from '@/components/shared/NotificationPopover';
import SettingsPage from '@/components/shared/SettingsPage';
import { CreateJobModal } from '@/components/shared/Modals';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { LayoutDashboard, Briefcase, Users, Calendar, BarChart3, Settings, LogOut, Menu, Plus, Search, ChevronDown, Command, Bot } from 'lucide-react';
import { Job } from '@/types';

const PAGE_LABELS: Record<string, string> = {
  'recruiter-dashboard': 'Dashboard',
  'recruiter-jobs': 'Jobs',
  'recruiter-kanban': 'Pipeline',
  'recruiter-table': 'Pipeline',
  'recruiter-candidates': 'Talent Pool',
  'recruiter-settings': 'Settings',
};

const RecruiterPortal = () => {
  const { page, setPage, jobs, applications, logout, selectedJobId, setSelectedJobId, kanbanSearch, setKanbanSearch, companyInfo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = [
    { id: 'recruiter-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recruiter-jobs', label: 'Jobs', icon: Briefcase },
    { id: 'recruiter-candidates', label: 'Candidates', icon: Users },
    { id: 'recruiter-interviews', label: 'Interviews', icon: Calendar },
    { id: 'recruiter-reports', label: 'Reports', icon: BarChart3 },
    { id: 'recruiter-settings', label: 'Settings', icon: Settings },
  ];

  const isNavActive = (navId: string) => {
    if (navId === 'recruiter-dashboard') return page === 'recruiter-dashboard';
    if (navId === 'recruiter-jobs') return page === 'recruiter-jobs' || page === 'recruiter-kanban' || page === 'recruiter-table';
    if (navId === 'recruiter-candidates') return page === 'recruiter-candidates';
    if (navId === 'recruiter-settings') return page === 'recruiter-settings';
    return false;
  };

  const handleNavClick = (navId: string) => {
    if (navId === 'recruiter-interviews' || navId === 'recruiter-reports') {
      setPage('recruiter-dashboard');
    } else {
      setPage(navId);
    }
  };

  const currentJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : jobs[0];

  // Page transition state
  const [animating, setAnimating] = useState(false);
  const [displayedPage, setDisplayedPage] = useState(page);
  const [displayedViewMode, setDisplayedViewMode] = useState(viewMode);
  const prevPageRef = useRef(page);
  const prevViewModeRef = useRef(viewMode);

  useEffect(() => {
    if (page !== prevPageRef.current || viewMode !== prevViewModeRef.current) {
      setAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedPage(page);
        setDisplayedViewMode(viewMode);
        setAnimating(false);
      }, 150);
      prevPageRef.current = page;
      prevViewModeRef.current = viewMode;
      return () => clearTimeout(timeout);
    }
  }, [page, viewMode]);

  const renderContent = () => {
    const p = displayedPage;
    const vm = displayedViewMode;
    if (p === 'recruiter-dashboard') return <RecruiterDashboard />;
    if (p === 'recruiter-settings') return <SettingsPage />;
    if (p === 'recruiter-jobs') return <JobManagementList />;
    if (p === 'recruiter-candidates') return <TalentPool />;
    if (p === 'recruiter-kanban' || p === 'recruiter-table') {
      if (!currentJob) return <p className="text-muted-foreground">No jobs yet.</p>;
      return vm === 'kanban'
        ? <KanbanBoard job={currentJob} onEditJob={j => { setEditJob(j); setCreateJobOpen(true); }} />
        : <CandidateTableView job={currentJob} onEditJob={j => { setEditJob(j); setCreateJobOpen(true); }} />;
    }
    return <RecruiterDashboard />;
  };

  const showBoardControls = page === 'recruiter-kanban' || page === 'recruiter-table';

  const getBreadcrumbs = () => {
    const crumbs: { label: string; page?: string }[] = [{ label: 'VietRecruit' }];
    const currentLabel = PAGE_LABELS[page] || 'Dashboard';
    if (showBoardControls && currentJob) {
      crumbs.push({ label: 'Jobs', page: 'recruiter-jobs' });
      crumbs.push({ label: currentJob.title });
    } else {
      crumbs.push({ label: currentLabel });
    }
    return crumbs;
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Left Sidebar — Ultra-minimal icon rail with expand-on-hover */}
      <aside
        className={`hidden md:flex flex-col bg-foreground shrink-0 border-r border-primary-foreground/[0.04] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarExpanded ? 'w-52' : 'w-[60px]'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Tenant logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-primary-foreground/[0.04]">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-[10px] font-bold">VR</span>
          </div>
          <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-primary-foreground/90 truncate whitespace-nowrap">{companyInfo.name || 'VietRecruit'}</span>
              <ChevronDown size={10} className="text-primary-foreground/20 shrink-0" />
            </div>
          </div>
        </div>

        {/* Cmd+K trigger — compact */}
        <div className="px-2.5 pt-3 pb-1">
          <button
            onClick={() => setCmdOpen(true)}
            className={`flex items-center gap-2 rounded-lg bg-primary-foreground/[0.04] hover:bg-primary-foreground/[0.08] border border-primary-foreground/[0.06] text-primary-foreground/30 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              sidebarExpanded ? 'w-full px-3 py-1.5' : 'w-9 h-9 justify-center'
            }`}
          >
            <Search size={13} className="shrink-0" />
            {sidebarExpanded && (
              <>
                <span className="flex-1 text-left text-xs whitespace-nowrap">Search…</span>
                <kbd className="text-[9px] font-mono text-primary-foreground/15">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation — icon-first */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const active = isNavActive(item.id);
            return (
              <Tooltip key={item.id} delayDuration={sidebarExpanded ? 999999 : 200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      sidebarExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center'
                    } ${
                      active
                        ? 'text-primary-foreground bg-primary-foreground/[0.08]'
                        : 'text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.04]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                      {active && (
                        <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    {sidebarExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                  </button>
                </TooltipTrigger>
                {!sidebarExpanded && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: User */}
        <div className="p-2.5 border-t border-primary-foreground/[0.04]">
          <div className={`flex items-center ${sidebarExpanded ? 'gap-3 px-1' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">HR</div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-primary-foreground/60 truncate">HR Manager</p>
                <p className="text-[9px] text-primary-foreground/25 font-mono">Admin</p>
              </div>
            )}
          </div>
          <Tooltip delayDuration={sidebarExpanded ? 999999 : 200}>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={`flex items-center gap-2 mt-2 rounded-lg text-[11px] text-primary-foreground/25 hover:text-primary-foreground/50 hover:bg-primary-foreground/[0.04] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  sidebarExpanded ? 'w-full px-3 py-1.5' : 'w-full justify-center py-1.5'
                }`}
              >
                <LogOut size={12} />
                {sidebarExpanded && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {!sidebarExpanded && (
              <TooltipContent side="right" className="text-xs">Logout</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[260px] bg-foreground p-0 border-r border-primary-foreground/[0.04]">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <div className="flex flex-col h-full">
            <div className="h-14 flex items-center gap-3 px-4 border-b border-primary-foreground/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold">VR</span>
              </div>
              <span className="text-sm font-semibold text-primary-foreground/90">{companyInfo.name || 'VietRecruit'}</span>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { handleNavClick(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isNavActive(item.id) ? 'bg-primary-foreground/[0.08] text-primary-foreground' : 'text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.04]'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-primary-foreground/[0.04]">
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.04]">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Floating breadcrumb + Cmd+K header */}
        <header className="h-11 flex items-center justify-between px-4 md:px-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={16} />
            </button>
            <Breadcrumb>
              <BreadcrumbList>
                {getBreadcrumbs().map((crumb, i, arr) => (
                  <React.Fragment key={i}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {i < arr.length - 1 && crumb.page ? (
                        <BreadcrumbLink className="cursor-pointer text-[11px]" onClick={() => crumb.page && setPage(crumb.page)}>
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : i === arr.length - 1 ? (
                        <BreadcrumbPage className="text-[11px] font-medium">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-muted-foreground text-xs transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <Search size={12} />
              <span className="text-muted-foreground/50">Search…</span>
              <kbd className="ml-4 text-[9px] font-mono text-muted-foreground/30 border border-border/40 px-1 py-0.5 rounded">⌘K</kbd>
            </button>
            <NotificationPopover role="recruiter" />
            <button
              onClick={() => setChatOpen(prev => !prev)}
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                chatOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Bot size={15} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            </button>
            <Button variant="outline" size="sm" className="md:hidden h-8 w-8 p-0" onClick={() => { setEditJob(null); setCreateJobOpen(true); }}>
              <Plus size={14} />
            </Button>
          </div>
        </header>

        {/* Dashboard hero */}
        {page === 'recruiter-dashboard' && (
          <div className="mx-4 md:mx-6 mt-4 md:mt-6">
            <div className="relative h-36 bg-foreground text-primary-foreground rounded-xl p-6 overflow-hidden border border-primary-foreground/[0.04]">
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, hsla(180,100%,27%,0.2), transparent 70%)' }} />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <span className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-foreground/[0.06] text-[9px] font-semibold tracking-[0.15em] uppercase">
                  AI-Powered Recruitment
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Recruitment Overview</h2>
                  <p className="text-[11px] text-primary-foreground/30 mt-1 font-mono">{jobs.filter(j => j.isActive).length} active positions · {applications.length} candidates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Context Bar — Board views */}
        {showBoardControls && currentJob && (
          <div className="mx-4 md:mx-6 mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold tracking-tight truncate">{currentJob.title}</h2>
                <p className="text-[11px] text-muted-foreground">{currentJob.department} · {currentJob.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative max-w-[200px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter…"
                    value={kanbanSearch}
                    onChange={e => setKanbanSearch(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-card pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
                <div className="flex bg-secondary rounded-lg p-0.5 border border-border/40">
                  <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewMode === 'kanban' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>Board</button>
                  <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewMode === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>Table</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              animating
                ? 'opacity-0 translate-y-2 scale-[0.99]'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(prev => !prev)} />
      <CreateJobModal open={createJobOpen} onClose={() => { setCreateJobOpen(false); setEditJob(null); }} editJob={editJob} />
      <CopilotChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
    </TooltipProvider>
  );
};

export default RecruiterPortal;
