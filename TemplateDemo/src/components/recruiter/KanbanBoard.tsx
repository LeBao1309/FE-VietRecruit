import React, { useState, useRef } from 'react';
import { useApp } from '@/store/AppContext';
import { Job, Application } from '@/types';
import ScoreBadge, { ScoreBar, getScoreColor } from '@/components/shared/ScoreBadge';
import { InterviewModal, RejectionModal, OfferLetterModal } from '@/components/shared/Modals';
import { ArrowLeft, Calendar, Pencil, GripVertical, CalendarPlus, Upload, Check, Loader2, Star, FileText, ArrowRight } from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/calendarExport';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import CandidateDetailDrawer from './CandidateDetailDrawer';

const COLUMNS = ['Applied', 'Screening', 'Interview', 'Offer'] as const;
const COLUMN_LABELS: Record<string, string> = {
  Applied: 'New',
  Screening: 'Screening',
  Interview: 'Interview',
  Offer: 'Offer',
};

interface Props { job: Job; onEditJob: (j: Job) => void; }

const KanbanBoard: React.FC<Props> = ({ job, onEditJob }) => {
  const { applications, moveCandidateStage, toggleJobActive, kanbanSearch, setPage, getScorecardForApp, settings } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [rejectApp, setRejectApp] = useState<Application | null>(null);
  const [offerApp, setOfferApp] = useState<Application | null>(null);
  const [prevColumn, setPrevColumn] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportedIds, setExportedIds] = useState<Set<string>>(new Set());
  const [hideLowMatch, setHideLowMatch] = useState(false);
  const [dragSourceCol, setDragSourceCol] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const draggedApp = draggedId ? applications.find(a => a.id === draggedId) : null;

  const handleExportHRIS = (appId: string) => {
    setExportingId(appId);
    setTimeout(() => {
      setExportingId(null);
      setExportedIds(prev => new Set(prev).add(appId));
      toast({ title: '✅ Data exported to HR System', description: 'Onboarding workflow started.' });
    }, 1500);
  };

  const jobApps = applications.filter(a => a.jobId === job.id);

  const getDuplicateInfo = (app: Application) => {
    const sameEmail = applications.filter(a => a.candidateEmail === app.candidateEmail && a.id !== app.id);
    return sameEmail.length > 0 ? sameEmail : null;
  };

  const matchesSearch = (app: Application) => {
    if (!kanbanSearch) return true;
    const q = kanbanSearch.toLowerCase();
    return app.candidateName.toLowerCase().includes(q) ||
      app.candidateEmail.toLowerCase().includes(q) ||
      app.candidateSkills.some(s => s.toLowerCase().includes(q));
  };

  const handleDragStart = (e: React.DragEvent, appId: string, fromCol: string) => {
    setDraggedId(appId);
    setPrevColumn(fromCol);
    setDragSourceCol(fromCol);
    e.dataTransfer.effectAllowed = 'move';
    // Use transparent pixel to hide native ghost
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  };

  const handleDrop = (e: React.DragEvent, toCol: string) => {
    e.preventDefault();
    setDragOverCol(null);
    setDragSourceCol(null);
    if (!draggedId) return;
    const app = applications.find(a => a.id === draggedId);
    if (!app || app.status === 'Withdrawn' || app.status === 'Rejected') return;
    if (app.status === toCol) { setDraggedId(null); return; }
    if (toCol === 'Interview') { setInterviewApp(app); }
    else if (toCol === 'Offer') { setOfferApp(app); }
    else { moveCandidateStage(draggedId, toCol); }
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
    setDragSourceCol(null);
  };

  const handleMoveSelect = (app: Application, newStatus: string) => {
    if (newStatus === app.status) return;
    if (newStatus === 'Interview') { setInterviewApp(app); setPrevColumn(app.status); }
    else if (newStatus === 'Offer') { setOfferApp(app); }
    else { moveCandidateStage(app.id, newStatus); }
  };

  const timeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const hours = Math.floor(diffMs / 3600000);
      if (hours < 1) return 'just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return `${Math.floor(days / 7)}w ago`;
    } catch { return ''; }
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="animate-fade-up">
      <button onClick={() => setPage('recruiter-jobs')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 min-h-10 transition-colors">
        <ArrowLeft size={14} /> Back to Jobs
      </button>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-lg font-semibold tracking-tight">{job.title}</h1>
        <button onClick={() => onEditJob(job)} className="w-8 h-8 rounded-lg border border-border/40 flex items-center justify-center hover:bg-secondary transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <Pencil size={13} />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setHideLowMatch(!hideLowMatch)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hideLowMatch ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {hideLowMatch ? 'Hide < 30%' : 'Show All'}
          </button>
          <button
            onClick={() => toggleJobActive(job.id)}
            className={`relative w-10 h-5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${job.isActive ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${job.isActive ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className="text-[10px] font-medium">{job.isActive ? 'Active' : 'Closed'}</span>
        </div>
      </div>

      {/* Column summary chips */}
      <div className="flex gap-2 mb-4 text-[10px]">
        {COLUMNS.map(col => {
          const count = jobApps.filter(a => a.status === col).length;
          return (
            <span key={col} className="px-2 py-1 rounded-md bg-card border border-border/40 font-mono-num font-medium text-muted-foreground">
              {COLUMN_LABELS[col]}: {count}
            </span>
          );
        })}
      </div>

      {/* Kanban Columns — Linear-style tight layout */}
      <div
        className="flex gap-3 overflow-x-auto pb-4 flex-1 items-start kanban-scroll relative"
        style={{ minHeight: 400 }}
        onDragOver={e => {
          e.preventDefault();
          setMousePos({ x: e.clientX, y: e.clientY });
        }}
      >
        {COLUMNS.map((col, colIdx) => {
          const colApps = jobApps.filter(a => a.status === col).sort((a, b) => b.score - a.score);
          const label = COLUMN_LABELS[col];
          return (
            <div
              key={col}
              className={`flex-1 min-w-[260px] rounded-xl p-3 border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] relative ${
                dragOverCol === col && dragSourceCol !== col
                  ? 'border-primary/30 bg-primary/[0.04] shadow-[0_0_30px_-4px_hsl(180_100%_27%/0.15),inset_0_0_20px_-4px_hsl(180_100%_27%/0.05)] scale-[1.01]'
                  : draggedId && dragSourceCol === col
                    ? 'border-border/20 bg-secondary/20 opacity-80'
                    : 'border-border/30 bg-secondary/30'
              }`}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverCol(col); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
              onDrop={e => handleDrop(e, col)}
            >
              {/* Drop zone glow indicator */}
              {dragOverCol === col && dragSourceCol !== col && (
                <div className="absolute inset-0 rounded-xl pointer-events-none z-20 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(180_100%_27%/0.06),transparent_70%)]" />
                  <div className="absolute inset-[-1px] rounded-xl animate-dropzone-pulse" style={{
                    background: 'conic-gradient(from 0deg, transparent 60%, hsl(180 100% 27% / 0.3) 80%, transparent 100%)',
                    maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                  }} />
                  {/* Drop hint */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium shadow-lg animate-fade-up">
                    <ArrowRight size={10} /> Drop to {COLUMN_LABELS[col]}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    col === 'Applied' ? 'bg-primary' : col === 'Screening' ? 'bg-indigo' : col === 'Interview' ? 'bg-amber' : 'bg-emerald'
                  }`} />
                  <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{label}</h3>
                </div>
                <span className="font-mono-num text-[10px] px-1.5 py-0.5 rounded-md bg-card border border-border/30 text-muted-foreground">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-2">
                {colApps.length === 0 && (
                  <div className="border border-dashed border-border/30 rounded-lg p-6 text-center">
                    <p className="text-[10px] text-muted-foreground/50">Drop candidates here</p>
                  </div>
                )}
                {colApps.map((app, appIdx) => {
                  const isWithdrawn = app.status === 'Withdrawn';
                  const isRejected = app.status === 'Rejected';
                  const isBlacklisted = app.isBlacklisted;
                  const isDraggable = !isWithdrawn && !isRejected && !isBlacklisted && !isMobile;
                  const matches = matchesSearch(app);
                  const isVeryLow = app.score < 30;
                  const duplicates = getDuplicateInfo(app);
                  const scorecard = getScorecardForApp(app.id);

                  if (hideLowMatch && isVeryLow) return null;

                  return (
                    <div
                      key={app.id}
                      draggable={isDraggable}
                      onDragStart={e => isDraggable && handleDragStart(e, app.id, col)}
                      onDragEnd={handleDragEnd}
                      onMouseMove={e => {
                        if (draggedId) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                      }}
                      style={{ animationDelay: `${appIdx * 30}ms` }}
                      className={`spotlight-card kanban-card-enter bg-card border border-border/20 rounded-xl p-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 hover:shadow-[0_8px_30px_-8px_hsl(180_100%_27%/0.08)] hover:-translate-y-0.5 ${
                        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                      } ${draggedId === app.id ? 'opacity-30 scale-95 rotate-0 border-primary/20 border-dashed' : ''} ${
                        isWithdrawn ? 'opacity-40' : isRejected ? 'opacity-50' : ''
                      } ${!matches && kanbanSearch ? 'opacity-[0.12]' : ''} ${
                        matches && kanbanSearch ? 'ring-1 ring-primary/15' : ''
                      }`}
                    >
                      {/* Clickable overlay — opens detail drawer */}
                      <div
                        className="absolute inset-0 z-[3] cursor-pointer"
                        onClick={(e) => {
                          // Don't open if clicking buttons/selects inside card
                          if ((e.target as HTMLElement).closest('button, select, a')) return;
                          if (!draggedId) setSelectedApp(app);
                        }}
                      />
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isDraggable && <GripVertical size={11} className="text-muted-foreground/20 shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate tracking-tight">{app.candidateName}</p>
                            <p className="text-[10px] text-muted-foreground/50 font-mono-num">{app.appliedDate ? timeAgo(app.appliedDate) : ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Match Badge — Marrs Green glow */}
                      <div className="mb-2.5 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[10px] font-semibold ring-1 ring-primary/15">
                          ✨ {app.score}% AI Match
                        </span>
                        {app.scoreUpdated && <span className="ml-1 text-[8px] font-mono-num px-1 py-0.5 rounded bg-amber-light text-amber-dark">↻</span>}
                      </div>

                      {/* Badges row */}
                      {(getDuplicateInfo(app) || isBlacklisted || app.isGuest) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {duplicates && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-light text-amber-dark">⚠ Duplicate</span>}
                          {isBlacklisted && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">🚫 Blocked</span>}
                          {app.isGuest && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary text-muted-foreground">Guest</span>}
                        </div>
                      )}

                      {/* Scorecard / Interview metrics */}
                      {(col === 'Interview' || col === 'Offer') && (
                        <div className="mb-2 space-y-1">
                          {scorecard && (
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-muted-foreground/60">Avg Score:</span>
                              <span className="font-mono-num font-semibold flex items-center gap-0.5">
                                <Star size={9} className="fill-amber text-amber" />{scorecard.rating}/5
                              </span>
                            </div>
                          )}
                          {app.interviewDate && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                              <Calendar size={9} />
                              <span className="font-mono-num">{app.interviewDate} · {app.interviewTime}</span>
                              <span className="text-primary font-medium ml-1">Completed</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skill tags — ghost style */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.candidateSkills.slice(0, 3).map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded-md bg-secondary/80 border border-border/20 text-[9px] font-medium text-muted-foreground/70 truncate max-w-[80px]">{s}</span>
                        ))}
                      </div>

                      {/* HRIS Export for Offer */}
                      {app.status === 'Offer' && (
                        <div className="mb-2">
                          {exportedIds.has(app.id) ? (
                            <span className="flex items-center gap-1 text-[10px] text-primary font-medium"><Check size={9} /> Exported</span>
                          ) : exportingId === app.id ? (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Loader2 size={9} className="animate-spin" /> Exporting...</span>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); handleExportHRIS(app.id); }}
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] font-medium"
                            >
                              <Upload size={9} /> Export to HRIS
                            </button>
                          )}
                        </div>
                      )}

                      {isWithdrawn && <span className="inline-block mb-2 text-[9px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">Withdrawn</span>}
                      {isRejected && <span className="inline-block mb-2 text-[9px] px-2 py-0.5 rounded bg-red-light text-red-dark">Rejected</span>}

                      {/* Footer */}
                      <div className="pt-3 border-t border-border/20 flex items-center gap-2 relative z-[4]">
                        <button className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border/20 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] font-medium">
                          <FileText size={9} /> View CV
                        </button>
                        <select
                          value={app.status}
                          onChange={e => handleMoveSelect(app, e.target.value)}
                          disabled={!isDraggable && !isMobile}
                          className={`flex-1 rounded-md border border-border/20 bg-card px-2 text-[10px] font-medium disabled:opacity-50 transition-colors ${isMobile ? 'h-9 text-xs' : 'h-7'}`}
                          title={!isDraggable ? 'Status is final' : 'Move to stage'}
                        >
                          {COLUMNS.map(c => <option key={c} value={c}>{COLUMN_LABELS[c]}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating ghost card — follows cursor during drag */}
      {draggedApp && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            left: mousePos.x - 120,
            top: mousePos.y - 30,
          }}
        >
          <div className="w-60 bg-card/95 backdrop-blur-sm border border-primary/30 rounded-xl p-3 shadow-[0_20px_60px_-12px_hsl(180_100%_27%/0.25),0_0_0_1px_hsl(180_100%_27%/0.1)] rotate-[2deg] scale-[0.95]">
            <div className="flex items-center gap-2 mb-1.5">
              <GripVertical size={10} className="text-primary/40" />
              <p className="text-xs font-medium truncate">{draggedApp.candidateName}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold ring-1 ring-primary/20">
              ✨ {draggedApp.score}% AI Match
            </span>
            <div className="flex gap-1 mt-1.5">
              {draggedApp.candidateSkills.slice(0, 2).map(s => (
                <span key={s} className="px-1 py-0.5 rounded bg-secondary/80 text-[8px] text-muted-foreground truncate max-w-[60px]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {interviewApp && (
        <InterviewModal open={true} onClose={() => setInterviewApp(null)} appId={interviewApp.id} candidateName={interviewApp.candidateName}
          onCancel={() => { if (prevColumn && interviewApp) { moveCandidateStage(interviewApp.id, prevColumn); } setInterviewApp(null); }}
        />
      )}
      {rejectApp && <RejectionModal open={true} onClose={() => setRejectApp(null)} appId={rejectApp.id} candidateName={rejectApp.candidateName} />}
      {offerApp && <OfferLetterModal open={true} onClose={() => setOfferApp(null)} app={offerApp} job={job} />}

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        app={selectedApp}
        job={job}
        onClose={() => setSelectedApp(null)}
        onMoveStage={(app, status) => {
          if (status === 'Interview') { setInterviewApp(app); setPrevColumn(app.status); }
          else if (status === 'Offer') { setOfferApp(app); }
          else { moveCandidateStage(app.id, status); }
          setSelectedApp(null);
        }}
        onReject={(app) => { setRejectApp(app); setSelectedApp(null); }}
      />
    </div>
    </TooltipProvider>
  );
};

export default KanbanBoard;
