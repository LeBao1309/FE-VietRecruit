import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Job } from '@/types';
import { Button } from '@/components/ui/button';
import ScoreBadge, { getScoreColor } from '@/components/shared/ScoreBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GuestApplyModal, CandidateCVUploadModal } from '@/components/shared/Modals';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Clock, DollarSign, Link2 } from 'lucide-react';
import { CURRENT_CANDIDATE_ID } from '@/data/mockData';
import { loadEmailTemplates, replaceVariables } from '@/lib/emailTemplates';

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc ml-4 space-y-1 text-sm">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={i} className="text-[15px] font-semibold mt-4 mb-2">{trimmed.slice(3)}</h3>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      listItems.push(<li key={i} className="text-sm text-text-secondary" dangerouslySetInnerHTML={{ __html: content }} />);
    } else if (trimmed === '') {
      flushList();
      elements.push(<br key={i} />);
    } else {
      flushList();
      const content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      elements.push(<p key={i} className="text-sm text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />);
    }
  });
  flushList();
  return elements;
}

interface Props { job: Job; onClose: () => void; }

const JobDetailDrawer: React.FC<Props> = ({ job, onClose }) => {
  const { applications, applyToJob, profile, setPage, role, hasCV } = useApp();
  const { toast } = useToast();
  const [guestApplyOpen, setGuestApplyOpen] = useState(false);
  const [cvUploadOpen, setCvUploadOpen] = useState(false);
  const [applyAfterUpload, setApplyAfterUpload] = useState(false);

  const isLoggedIn = !!role;
  const canUseAI = isLoggedIn && hasCV;
  const applied = isLoggedIn ? applications.find(a => a.candidateId === CURRENT_CANDIDATE_ID && a.jobId === job.id && a.status !== 'Withdrawn') : null;
  const score = (() => {
    if (!isLoggedIn) return 0;
    if (job.skills.length === 0) return 50;
    const matched = profile.skills.filter(s => job.skills.some(js => js.toLowerCase() === s.toLowerCase())).length;
    return Math.min(100, Math.round((matched / job.skills.length) * 100));
  })();
  const colors = getScoreColor(score);

  const handleApply = () => {
    applyToJob(job.id);
    toast({ title: 'Application submitted!', description: `Applied to ${job.title}` });
    // Simulate auto-reply email
    const tpl = loadEmailTemplates().application_received;
    const subj = replaceVariables(tpl.subject, {
      '{candidate_name}': profile.name, '{job_title}': job.title,
      '{company_name}': job.company, '{salary}': '', '{meeting_link}': '', '{offer_date}': '',
    });
    setTimeout(() => {
      toast({ title: '📧 Auto-reply sent', description: subj });
    }, 1500);
  };

  return (
    <>
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">Browse Jobs / {job.title}</div>
              <button onClick={() => { navigator.clipboard.writeText(`https://talentos.app/j/${job.id}`); toast({ title: '🔗 Link copied to clipboard' }); }} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary" title="Copy link"><Link2 size={14} /></button>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-light text-indigo flex items-center justify-center text-lg font-bold shrink-0">
                {job.company[0]}
              </div>
              <div>
                <SheetTitle className="text-lg">{job.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs"><MapPin size={12} />{job.location}</span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs"><Clock size={12} />{job.type}</span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs font-mono-num"><DollarSign size={12} />${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}/mo</span>
          </div>

          {/* AI Match Panel */}
          {canUseAI ? (
            <div className="bg-canvas rounded-xl p-4 mb-6 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">AI Match Analysis</span>
                <ScoreBadge score={score} />
              </div>
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 80 80" className="w-16 h-16">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={score >= 80 ? 'hsl(var(--emerald))' : score >= 50 ? 'hsl(var(--amber))' : 'hsl(var(--red))'}
                    strokeWidth="6" strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="44" textAnchor="middle" className="text-sm font-bold fill-foreground font-mono">{score}%</text>
                </svg>
                <div className="space-y-1.5 text-xs flex-1">
                  {profile.skills.filter(s => job.skills.some(js => js.toLowerCase() === s.toLowerCase())).map(s => (
                    <div key={s} className="flex items-center gap-1.5"><span className="text-emerald">✅</span> {s}</div>
                  ))}
                  {job.skills.filter(s => !profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())).map(s => (
                    <div key={s} className="flex items-center gap-1.5"><span className="text-red">❌</span> {s}</div>
                  ))}
                </div>
              </div>
              {score < 50 ? (
                <div className="mt-3 rounded-lg bg-red-light/50 border border-red/20 p-3">
                  <p className="text-xs font-semibold text-red-dark mb-1.5">⚠️ Missing Critical Skills</p>
                  <p className="text-[11px] text-red-dark/80 mb-2">
                    You are missing: {job.skills.filter(s => !profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())).join(', ')}.
                  </p>
                  <p className="text-[10px] text-red-dark/60 italic">Consider adding these to your CV or learning them to improve your match.</p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-dark italic mt-2">Score updated based on latest profile</p>
              )}
            </div>
          ) : (
            <div className="relative rounded-xl mb-6 border border-border overflow-hidden">
              {/* Blurred background teaser */}
              <div className="p-4 filter blur-[4px] pointer-events-none select-none" aria-hidden="true">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">AI Match Analysis</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">— %</span>
                </div>
                <div className="flex items-center gap-4">
                  <svg viewBox="0 0 80 80" className="w-16 h-16">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="6" strokeDasharray="150 213.6" strokeLinecap="round" transform="rotate(-90 40 40)" />
                    <text x="40" y="44" textAnchor="middle" className="text-sm font-bold fill-foreground font-mono">?%</text>
                  </svg>
                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex items-center gap-1.5"><span>✅</span> Skill match</div>
                    <div className="flex items-center gap-1.5"><span>✅</span> Experience</div>
                    <div className="flex items-center gap-1.5"><span>❌</span> Missing skill</div>
                  </div>
                </div>
              </div>
              {/* Overlay CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <span className="text-3xl mb-2">{isLoggedIn ? '📄' : '🤖'}</span>
                <p className="text-sm font-semibold">{isLoggedIn ? 'Activate AI Scoring' : 'Curious about your fit?'}</p>
                <p className="text-xs text-muted-foreground mb-3 text-center px-4">
                  {isLoggedIn ? 'Upload your CV to see how well you match this job.' : 'Upload your CV to see how well you match this job instantly.'}
                </p>
                <Button variant="emerald" size="sm" onClick={() => isLoggedIn ? setCvUploadOpen(true) : setGuestApplyOpen(true)} className="gap-1.5">
                  📤 Upload CV & Check
                </Button>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Job Description</h3>
            <div className="space-y-1">{renderMarkdown(job.description)}</div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => (
                <span key={s} className="px-2 py-1 rounded-md bg-indigo-light text-indigo text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          {!job.isActive ? (
            <p className="text-center text-sm text-muted-foreground">This position is not accepting applications</p>
          ) : !isLoggedIn ? (
            <Button variant="emerald" className="w-full" size="lg" onClick={() => setGuestApplyOpen(true)}>
              👤 Apply as Guest
            </Button>
          ) : applied ? (
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(score).bg} ${getScoreColor(score).text}`}>
                {applied.status}
              </span>
              <Button variant="ghost" size="sm" onClick={() => { onClose(); setPage('my-applications'); }}>
                View status →
              </Button>
            </div>
          ) : !hasCV ? (
            <Button variant="emerald" className="w-full" size="lg" onClick={() => { setApplyAfterUpload(true); setCvUploadOpen(true); }}>
              Upload CV & Apply
            </Button>
          ) : (
            <Button variant="emerald" className="w-full" size="lg" onClick={handleApply}>
              Upload CV & Apply
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
    <GuestApplyModal open={guestApplyOpen} onClose={() => setGuestApplyOpen(false)} jobId={job.id} jobTitle={job.title} />
    <CandidateCVUploadModal
      open={cvUploadOpen}
      onClose={() => { setCvUploadOpen(false); setApplyAfterUpload(false); }}
      jobTitle={applyAfterUpload ? job.title : undefined}
      onComplete={applyAfterUpload ? () => { handleApply(); setCvUploadOpen(false); setApplyAfterUpload(false); } : undefined}
    />
    </>
  );
};

export default JobDetailDrawer;
