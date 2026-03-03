import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import { Search, Users, Briefcase, LayoutDashboard, Settings, ArrowRight, Sparkles, Clock, FileText, CalendarDays, Download } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type PaletteItem = {
  id: string;
  type: 'action' | 'suggestion' | 'nav' | 'candidate' | 'job';
  label: string;
  desc?: string;
  shortcut?: string;
  highlighted?: boolean;
  onSelect: () => void;
};

const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const { applications, jobs, setPage, setSelectedJobId } = useApp();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const q = query.toLowerCase();

  const handleNav = useCallback((page: string) => {
    setPage(page);
    onClose();
  }, [setPage, onClose]);

  const quickActions: PaletteItem[] = useMemo(() => [
    { id: 'qa-0', type: 'action', label: 'Extract skills from new CV', desc: 'AI-powered skill extraction', shortcut: '⌘E', highlighted: true, onSelect: () => setQuery('Extract skills') },
    { id: 'qa-1', type: 'action', label: 'Draft Offer Letter', desc: 'Generate AI-powered offer', shortcut: '⌘O', onSelect: () => setQuery('Draft Offer Letter') },
    { id: 'qa-2', type: 'action', label: 'Schedule Interview', desc: 'Find available time slots', shortcut: '⌘I', onSelect: () => setQuery('Schedule Interview') },
    { id: 'qa-3', type: 'action', label: 'Export Pipeline Report', desc: 'Download CSV summary', shortcut: '⌘⇧E', onSelect: () => setQuery('Export Pipeline Report') },
  ], []);

  const aiSuggestions: PaletteItem[] = useMemo(() => [
    'Find senior React developers with 5+ years',
    'Show candidates in Interview stage',
    'Top scored candidates this week',
  ].map((s, i) => ({ id: `ai-${i}`, type: 'suggestion' as const, label: s, onSelect: () => setQuery(s) })), []);

  const navItems: PaletteItem[] = useMemo(() => [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'recruiter-dashboard' },
    { label: 'Jobs', icon: Briefcase, page: 'recruiter-jobs' },
    { label: 'Talent Pool', icon: Users, page: 'recruiter-candidates' },
    { label: 'Settings', icon: Settings, page: 'recruiter-settings' },
  ]
    .filter(n => !q || n.label.toLowerCase().includes(q))
    .map(n => ({ id: `nav-${n.page}`, type: 'nav' as const, label: n.label, onSelect: () => handleNav(n.page) })),
  [q, handleNav]);

  const matchedCandidates: PaletteItem[] = useMemo(() => {
    if (!q) return [];
    return applications
      .filter(a => a.candidateName.toLowerCase().includes(q) || a.candidateSkills.some(s => s.toLowerCase().includes(q)))
      .slice(0, 5)
      .map(app => ({
        id: `cand-${app.id}`,
        type: 'candidate' as const,
        label: app.candidateName,
        desc: `${app.jobTitle} · ${app.status}`,
        onSelect: () => { setSelectedJobId(app.jobId); setPage('recruiter-kanban'); onClose(); },
      }));
  }, [q, applications, setSelectedJobId, setPage, onClose]);

  const matchedJobs: PaletteItem[] = useMemo(() => {
    if (!q) return [];
    return jobs
      .filter(j => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q))
      .slice(0, 3)
      .map(job => ({
        id: `job-${job.id}`,
        type: 'job' as const,
        label: job.title,
        desc: `${job.department} · ${job.location}`,
        onSelect: () => { setSelectedJobId(job.id); setPage('recruiter-kanban'); onClose(); },
      }));
  }, [q, jobs, setSelectedJobId, setPage, onClose]);

  const allItems = useMemo(() => {
    if (!q) return [...quickActions, ...aiSuggestions, ...navItems];
    return [...navItems, ...matchedCandidates, ...matchedJobs];
  }, [q, quickActions, aiSuggestions, navItems, matchedCandidates, matchedJobs]);

  useEffect(() => {
    setActiveIndex(0);
  }, [allItems.length, q]);

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % Math.max(allItems.length, 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + allItems.length) % Math.max(allItems.length, 1));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        allItems[activeIndex]?.onSelect();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, allItems, activeIndex]);

  if (!open) return null;

  let globalIndex = -1;
  const getIndex = () => ++globalIndex;

  const itemClass = (idx: number) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-150 ${
      idx === activeIndex
        ? 'bg-primary text-primary-foreground'
        : 'text-primary-foreground/50 hover:text-primary-foreground/80 hover:bg-primary-foreground/[0.04]'
    }`;

  const candidateApps = q ? applications
    .filter(a => a.candidateName.toLowerCase().includes(q) || a.candidateSkills.some(s => s.toLowerCase().includes(q)))
    .slice(0, 5) : [];
  const jobResults = q ? jobs
    .filter(j => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q))
    .slice(0, 3) : [];

  const actionIcons: Record<string, React.ReactNode> = {
    'qa-0': <FileText size={14} />,
    'qa-1': <Sparkles size={14} />,
    'qa-2': <CalendarDays size={14} />,
    'qa-3': <Download size={14} />,
  };

  return (
    <div className="fixed inset-0 z-[100] animate-cmd-backdrop" onClick={onClose}>
      {/* Backdrop — deep blur */}
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-xl" />

      {/* Modal — deeper Raycast panel */}
      <div className="relative flex items-start justify-center pt-[15vh]" onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-[640px] bg-foreground rounded-2xl overflow-hidden animate-cmd-modal ring-1 ring-primary-foreground/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_60px_rgba(0,0,0,0.6)] flex flex-col">
          {/* Search input — massive, borderless */}
          <div className="flex items-center gap-3 px-5 border-b border-primary-foreground/[0.04]">
            <Search size={18} className="text-primary-foreground/20 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Find candidate by skill, name, or AI query..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 h-14 bg-transparent text-lg text-primary-foreground placeholder:text-primary-foreground/15 outline-none"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 rounded-md border border-primary-foreground/[0.06] bg-primary-foreground/[0.03] text-[9px] font-mono text-primary-foreground/20">ESC</kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
            {/* Quick Actions */}
            {!q && (
              <div className="mb-1">
                <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/20">Quick Actions</p>
                {quickActions.map((action) => {
                  const idx = getIndex();
                  return (
                    <button
                      key={action.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={action.onSelect}
                      className={itemClass(idx)}
                    >
                      <span className={idx === activeIndex ? 'text-primary-foreground' : 'text-primary-foreground/30'}>
                        {actionIcons[action.id] || <Sparkles size={14} />}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[13px]">{action.label}</p>
                        <p className={`text-[10px] mt-0.5 ${idx === activeIndex ? 'text-primary-foreground/60' : 'text-primary-foreground/20'}`}>{action.desc}</p>
                      </div>
                      {action.shortcut && (
                        <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                          idx === activeIndex
                            ? 'bg-primary-foreground/20 text-primary-foreground/80'
                            : 'border border-primary-foreground/[0.06] text-primary-foreground/15'
                        }`}>{action.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Suggestions */}
            {!q && (
              <div className="mb-1">
                <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/20">AI Suggestions</p>
                {aiSuggestions.map((s) => {
                  const idx = getIndex();
                  return (
                    <button
                      key={s.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={s.onSelect}
                      className={itemClass(idx)}
                    >
                      <Clock size={13} className={idx === activeIndex ? 'text-primary-foreground/60' : 'text-primary-foreground/15'} />
                      <span className="flex-1 text-left truncate text-[13px]">{s.label}</span>
                      {idx === activeIndex && <ArrowRight size={12} className="text-primary-foreground/40" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            {navItems.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/20">Navigate</p>
                {navItems.map(n => {
                  const idx = getIndex();
                  const navMeta = [
                    { page: 'recruiter-dashboard', icon: LayoutDashboard },
                    { page: 'recruiter-jobs', icon: Briefcase },
                    { page: 'recruiter-candidates', icon: Users },
                    { page: 'recruiter-settings', icon: Settings },
                  ].find(nm => n.id === `nav-${nm.page}`);
                  const Icon = navMeta?.icon || LayoutDashboard;
                  return (
                    <button
                      key={n.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={n.onSelect}
                      className={itemClass(idx)}
                    >
                      <Icon size={14} className={idx === activeIndex ? 'text-primary-foreground/60' : 'text-primary-foreground/20'} />
                      <span className="text-[13px]">{n.label}</span>
                      {idx === activeIndex && <ArrowRight size={12} className="text-primary-foreground/40" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Candidates */}
            {q && candidateApps.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/20">Candidates</p>
                {candidateApps.map(app => {
                  const idx = getIndex();
                  return (
                    <button
                      key={app.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => { setSelectedJobId(app.jobId); setPage('recruiter-kanban'); onClose(); }}
                      className={itemClass(idx)}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        idx === activeIndex ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary'
                      }`}>
                        {app.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[13px] font-medium truncate">{app.candidateName}</p>
                        <p className={`text-[10px] ${idx === activeIndex ? 'text-primary-foreground/50' : 'text-primary-foreground/20'}`}>{app.jobTitle} · {app.status}</p>
                      </div>
                      <span className={`text-xs font-mono font-medium ${idx === activeIndex ? 'text-primary-foreground/80' : 'text-primary'}`}>{app.score}%</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Jobs */}
            {q && jobResults.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/20">Jobs</p>
                {jobResults.map(job => {
                  const idx = getIndex();
                  return (
                    <button
                      key={job.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => { setSelectedJobId(job.id); setPage('recruiter-kanban'); onClose(); }}
                      className={itemClass(idx)}
                    >
                      <Briefcase size={14} className={idx === activeIndex ? 'text-primary-foreground/60' : 'text-primary-foreground/20'} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[13px] font-medium truncate">{job.title}</p>
                        <p className={`text-[10px] ${idx === activeIndex ? 'text-primary-foreground/50' : 'text-primary-foreground/20'}`}>{job.department} · {job.location}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ring-1 ${
                        idx === activeIndex
                          ? (job.isActive ? 'bg-primary-foreground/20 text-primary-foreground ring-primary-foreground/30' : 'bg-primary-foreground/10 text-primary-foreground/60 ring-primary-foreground/20')
                          : (job.isActive ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-primary-foreground/[0.04] text-primary-foreground/30 ring-primary-foreground/[0.06]')
                      }`}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {q && matchedCandidates.length === 0 && matchedJobs.length === 0 && navItems.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-primary-foreground/20">No results for "{query}"</p>
                <p className="text-[10px] text-primary-foreground/10 mt-1">Try different keywords</p>
              </div>
            )}
          </div>

          {/* Footer — Stripe-polish */}
          <div className="flex items-center gap-5 px-5 py-2.5 border-t border-primary-foreground/[0.04]">
            <span className="text-[9px] text-primary-foreground/15 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-primary-foreground/[0.06] bg-primary-foreground/[0.03] text-[8px] font-mono">↑↓</kbd>
              <span className="tracking-wide">Navigate</span>
            </span>
            <span className="text-[9px] text-primary-foreground/15 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-primary-foreground/[0.06] bg-primary-foreground/[0.03] text-[8px] font-mono">↵</kbd>
              <span className="tracking-wide">Select</span>
            </span>
            <span className="text-[9px] text-primary-foreground/15 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-primary-foreground/[0.06] bg-primary-foreground/[0.03] text-[8px] font-mono">esc</kbd>
              <span className="tracking-wide">Close</span>
            </span>
            <span className="ml-auto text-[8px] text-primary/40 font-semibold tracking-[0.1em] uppercase">AI Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
