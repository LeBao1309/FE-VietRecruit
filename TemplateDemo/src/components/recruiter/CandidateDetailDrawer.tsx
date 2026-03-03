import React from 'react';
import { Application, Job } from '@/types';
import { useApp } from '@/store/AppContext';
import {
  X, Mail, Phone, MapPin, Calendar, Clock, Star, Briefcase,
  ExternalLink, FileText, MessageSquare, ChevronRight, Sparkles,
  User, Award, TrendingUp
} from 'lucide-react';

interface Props {
  app: Application | null;
  job: Job;
  onClose: () => void;
  onMoveStage: (app: Application, status: string) => void;
  onReject: (app: Application) => void;
}

const COLUMN_LABELS: Record<string, string> = {
  Applied: 'New',
  Screening: 'Screening',
  Interview: 'Interview',
  Offer: 'Offer',
};

const CandidateDetailDrawer: React.FC<Props> = ({ app, job, onClose, onMoveStage, onReject }) => {
  const { getScorecardForApp, getActivitiesForApp } = useApp();

  if (!app) return null;

  const scorecard = getScorecardForApp(app.id);
  const activities = getActivitiesForApp(app.id);

  const scoreColor = app.score >= 80 ? 'text-primary' : app.score >= 60 ? 'text-amber' : 'text-red';
  const scoreBg = app.score >= 80 ? 'bg-primary/10 ring-primary/20' : app.score >= 60 ? 'bg-amber/10 ring-amber/20' : 'bg-red/10 ring-red/20';

  const statusColors: Record<string, string> = {
    Applied: 'bg-primary/10 text-primary ring-primary/20',
    Screening: 'bg-indigo/10 text-indigo ring-indigo/20',
    Interview: 'bg-amber/10 text-amber ring-amber/20',
    Offer: 'bg-emerald/10 text-emerald ring-emerald/20',
    Rejected: 'bg-red/10 text-red ring-red/20',
    Withdrawn: 'bg-muted text-muted-foreground ring-border',
  };

  const nextStage = (() => {
    const stages = ['Applied', 'Screening', 'Interview', 'Offer'];
    const idx = stages.indexOf(app.status);
    return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : null;
  })();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm animate-cmd-backdrop"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-[71] w-full max-w-[480px] animate-slide-in-right">
        <div className="h-full bg-card/85 backdrop-blur-2xl border-l border-border/30 shadow-[−20px_0_60px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">

          {/* Header — glassmorphism hero */}
          <div className="relative px-6 pt-5 pb-6 border-b border-border/20">
            {/* Gradient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl opacity-30" style={{
                background: `radial-gradient(circle, hsl(180 100% 27% / 0.4), transparent 70%)`
              }} />
            </div>

            <div className="relative z-10">
              {/* Close + status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ring-1 ${statusColors[app.status] || statusColors.Applied}`}>
                  {COLUMN_LABELS[app.status] || app.status}
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-lg font-bold shrink-0 ring-1 ring-primary/10">
                  {app.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight truncate">{app.candidateName}</h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{app.jobTitle}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {/* AI Score ring */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${scoreBg} ${scoreColor}`}>
                      <Sparkles size={11} />
                      {app.score}% AI Match
                    </div>
                    {app.candidateExperience > 0 && (
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <TrendingUp size={10} /> {app.candidateExperience}y exp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Contact info */}
            <div className="px-6 py-4 border-b border-border/10">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Contact</p>
              <div className="space-y-2">
                <a href={`mailto:${app.candidateEmail}`} className="flex items-center gap-3 text-[12px] text-muted-foreground hover:text-foreground transition-colors group">
                  <Mail size={13} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  <span className="truncate">{app.candidateEmail}</span>
                  <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40" />
                </a>
                {app.candidatePhone && (
                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <Phone size={13} className="text-muted-foreground/40" />
                    <span>{app.candidatePhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <Calendar size={13} className="text-muted-foreground/40" />
                  <span>Applied {formatDate(app.appliedDate)}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="px-6 py-4 border-b border-border/10">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {app.candidateSkills.map(skill => {
                  const isMatch = job.skills.some(js => js.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                        isMatch
                          ? 'bg-primary/[0.08] text-primary ring-1 ring-primary/15'
                          : 'bg-secondary/80 text-muted-foreground/70 border border-border/20'
                      }`}
                    >
                      {isMatch && '✓ '}{skill}
                    </span>
                  );
                })}
              </div>
              {job.skills.length > 0 && (
                <p className="text-[9px] text-muted-foreground/40 mt-2">
                  {app.candidateSkills.filter(s => job.skills.some(js => js.toLowerCase() === s.toLowerCase())).length}/{job.skills.length} required skills matched
                </p>
              )}
            </div>

            {/* Interview details */}
            {app.interviewDate && (
              <div className="px-6 py-4 border-b border-border/10">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Interview</p>
                <div className="bg-secondary/40 rounded-xl p-3 border border-border/15 space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Calendar size={12} className="text-primary" />
                    <span className="font-medium">{app.interviewDate}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <Clock size={12} className="text-muted-foreground/40" />
                    <span className="text-muted-foreground">{app.interviewTime}</span>
                  </div>
                  {app.interviewFormat && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Briefcase size={12} className="text-muted-foreground/40" />
                      <span>{app.interviewFormat}</span>
                      {app.interviewDuration && <span className="text-muted-foreground/40">· {app.interviewDuration}</span>}
                    </div>
                  )}
                  {app.meetingLink && (
                    <a href={app.meetingLink} target="_blank" rel="noopener" className="flex items-center gap-2 text-[11px] text-primary hover:underline">
                      <ExternalLink size={11} /> Join meeting
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Scorecard */}
            {scorecard && (
              <div className="px-6 py-4 border-b border-border/10">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Scorecard</p>
                <div className="bg-secondary/40 rounded-xl p-3 border border-border/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={13} className={i <= scorecard.rating ? 'fill-amber text-amber' : 'text-muted-foreground/20'} />
                      ))}
                      <span className="text-xs font-mono-num font-semibold ml-1">{scorecard.rating}/5</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${
                      scorecard.recommendation === 'Strongly Hire' ? 'bg-emerald/10 text-emerald ring-emerald/20' :
                      scorecard.recommendation === 'Hire' ? 'bg-primary/10 text-primary ring-primary/20' :
                      'bg-red/10 text-red ring-red/20'
                    }`}>{scorecard.recommendation}</span>
                  </div>
                  {scorecard.pros && (
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 mb-0.5">Strengths</p>
                      <p className="text-[11px] text-foreground/80">{scorecard.pros}</p>
                    </div>
                  )}
                  {scorecard.cons && (
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 mb-0.5">Concerns</p>
                      <p className="text-[11px] text-foreground/80">{scorecard.cons}</p>
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/40">by {scorecard.recruiterName} · {formatDate(scorecard.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {app.timeline.length > 0 && (
              <div className="px-6 py-4 border-b border-border/10">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Timeline</p>
                <div className="space-y-0">
                  {app.timeline.map((entry, i) => (
                    <div key={i} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${i === 0 ? 'bg-primary' : 'bg-border'}`} />
                        {i < app.timeline.length - 1 && <div className="w-px flex-1 bg-border/30 my-1" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-[11px] font-medium">{entry.status}</p>
                        <p className="text-[10px] text-muted-foreground/50 font-mono-num">{formatDate(entry.date)}</p>
                        {entry.message && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{entry.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            {activities.length > 0 && (
              <div className="px-6 py-4">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-3">Activity</p>
                <div className="space-y-2">
                  {activities.slice(0, 8).map(act => (
                    <div key={act.id} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === 'comment' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground/40'
                      }`}>
                        {act.type === 'comment' ? <MessageSquare size={9} /> : <Clock size={9} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-foreground/80">{act.message}</p>
                        <p className="text-[9px] text-muted-foreground/40 font-mono-num mt-0.5">
                          {act.author && <span className="text-muted-foreground/60">{act.author} · </span>}
                          {formatDate(act.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {app.privateNotes && (
              <div className="px-6 py-4 border-t border-border/10">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 mb-2">Private Notes</p>
                <p className="text-[11px] text-muted-foreground/70 bg-secondary/50 rounded-lg p-3 border border-border/10">{app.privateNotes}</p>
              </div>
            )}
          </div>

          {/* Footer actions — sticky */}
          {app.status !== 'Rejected' && app.status !== 'Withdrawn' && (
            <div className="px-6 py-4 border-t border-border/20 bg-card/90 backdrop-blur-sm flex items-center gap-2">
              <button
                onClick={() => onReject(app)}
                className="px-3 py-2 rounded-lg border border-border/30 text-[11px] font-medium text-muted-foreground hover:text-red hover:border-red/30 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                Reject
              </button>
              <div className="flex-1" />
              {nextStage && (
                <button
                  onClick={() => onMoveStage(app, nextStage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium shadow-[0_4px_14px_0_hsl(180_100%_27%/0.2)] hover:shadow-[0_6px_20px_hsl(180_100%_27%/0.25)] hover:-translate-y-px transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  Move to {COLUMN_LABELS[nextStage]}
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateDetailDrawer;
