import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Application } from '@/types';
import { Button } from '@/components/ui/button';
import ScoreBadge from '@/components/shared/ScoreBadge';
import { WithdrawDialog, ReapplyDialog } from '@/components/shared/Modals';
import { CURRENT_CANDIDATE_ID } from '@/data/mockData';
import { ChevronDown, ChevronUp, Video, ArrowLeft, FileX } from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer'];

const StageStepper = ({ current }: { current: string }) => {
  const idx = STAGES.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 ${i <= idx ? 'bg-emerald border-emerald' : 'border-muted bg-background'} ${i === idx ? 'animate-pulse-dot' : ''}`} />
            <span className="text-[9px] text-muted-foreground mt-1 whitespace-nowrap">{s}</span>
          </div>
          {i < STAGES.length - 1 && <div className={`w-6 h-0.5 mt-[-10px] ${i < idx ? 'bg-emerald' : 'bg-muted'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const REASON_MAP: Record<string, string> = {
  'Skillset mismatch': 'We are looking for candidates with a different technical stack.',
  'Experience too low': 'We are looking for someone with more seniority for this specific role.',
  'Salary expectations': 'Unfortunately, we could not align on compensation expectations at this time.',
  'Culture fit': 'We felt there may be a better cultural fit for this particular team.',
  'Position filled': 'This position has been filled.',
};

const RejectionFeedbackCard = ({ app, onBrowse }: { app: Application; onBrowse: () => void }) => (
  <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
    <div className="flex items-start gap-3">
      <FileX size={20} className="text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold">Application Status Update</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Thank you for applying to <span className="font-medium text-foreground">{app.jobTitle}</span> at <span className="font-medium text-foreground">{app.company}</span>. After careful review, we decided not to move forward at this time.
        </p>
        {app.rejectionReason && (
          <p className="text-xs text-muted-foreground mt-2">
            {REASON_MAP[app.rejectionReason] || app.rejectionReason}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2 italic">We will keep your resume on file for future openings.</p>
      </div>
    </div>
    <div className="flex justify-end">
      <Button variant="emeraldOutline" size="xs" onClick={onBrowse}>Browse Other Jobs</Button>
    </div>
  </div>
);

const MyApplications = () => {
  const { applications, setPage } = useApp();
  const myApps = applications.filter(a => a.candidateId === CURRENT_CANDIDATE_ID);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [withdrawApp, setWithdrawApp] = useState<string | null>(null);
  const [reapplyApp, setReapplyApp] = useState<string | null>(null);

  const unread = useApp().notifications.filter(n => n.recipientRole === 'candidate' && !n.isRead).length;

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setPage('browse-jobs')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-10">
          <ArrowLeft size={14} /> Back to Jobs
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold tracking-heading">My Applications</h1>
        <span className="font-mono-num text-xs px-2 py-0.5 rounded-full bg-secondary">{myApps.length}</span>
        {unread > 0 && <span className="w-2 h-2 rounded-full bg-notification" />}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Job & Company</th>
              <th className="text-left px-4 py-3 font-medium">Applied</th>
              <th className="text-left px-4 py-3 font-medium">AI Score</th>
              <th className="text-left px-4 py-3 font-medium">Stage</th>
              <th className="text-left px-4 py-3 font-medium">Last Update</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myApps.map(app => {
              const isWithdrawn = app.status === 'Withdrawn';
              const isRejected = app.status === 'Rejected';
              const dimmed = isWithdrawn || isRejected;
              return (
                <React.Fragment key={app.id}>
                  <tr
                    className={`border-b border-border hover:bg-accent/50 cursor-pointer transition-colors ${dimmed ? 'opacity-60' : ''}`}
                    onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{app.jobTitle}</div>
                      <div className="text-xs text-muted-foreground">{app.company}</div>
                    </td>
                    <td className="px-4 py-3 font-mono-num text-xs">{app.appliedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ScoreBadge score={app.score} size="sm" showLabel={false} updated={app.scoreUpdated} />
                        <span className="text-[9px] font-mono-num px-1 py-0.5 rounded-full bg-amber-light text-amber-dark">↻ Live</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isWithdrawn ? <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">Withdrawn</span>
                        : isRejected ? <span className="px-2 py-0.5 rounded-full bg-red-light text-red-dark text-xs">Not Selected</span>
                        : <StageStepper current={app.status} />}
                    </td>
                    <td className="px-4 py-3 font-mono-num text-xs text-muted-foreground">{app.lastUpdate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isWithdrawn && (
                          <Button variant="emeraldOutline" size="xs" onClick={e => { e.stopPropagation(); setReapplyApp(app.id); }}>Re-apply</Button>
                        )}
                        {!dimmed && app.status !== 'Offer' && (
                          <Button variant="ghost" size="xs" className="text-red" onClick={e => { e.stopPropagation(); setWithdrawApp(app.id); }}>Withdraw</Button>
                        )}
                        {app.status === 'Interview' && app.meetingLink && (
                          <a href={app.meetingLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                            <Button variant="emerald" size="xs"><Video size={12} /> Join</Button>
                          </a>
                        )}
                        {expanded === app.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </td>
                  </tr>
                  {expanded === app.id && (
                    <tr><td colSpan={6} className="px-4 py-4 bg-canvas">
                      {isRejected ? (
                        <RejectionFeedbackCard app={app} onBrowse={() => setPage('browse-jobs')} />
                      ) : (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Timeline</h4>
                          {app.timeline.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs">
                              <span className="font-mono-num text-muted-foreground w-20 shrink-0">{t.date}</span>
                              <span className="font-medium">{t.status}</span>
                              {t.message && <span className="text-muted-foreground">— {t.message}</span>}
                            </div>
                          ))}
                          {app.status === 'Interview' && app.interviewDate && (
                            <div className="mt-3 p-3 bg-emerald-light rounded-lg">
                              <p className="text-xs font-medium">📅 Interview: <span className="font-mono-num">{app.interviewDate} · {app.interviewTime} (GMT+7)</span></p>
                              {app.meetingLink && <a href={app.meetingLink} target="_blank" className="text-xs text-indigo underline mt-1 block">{app.meetingLink}</a>}
                            </div>
                          )}
                          <div className="mt-2 p-2 bg-amber-light rounded-lg text-xs text-amber-dark">
                            💡 AI Tip: {app.status === 'Applied' ? 'Your application is being reviewed. Make sure your profile is up to date.' :
                              app.status === 'Screening' ? 'Great progress! Prepare for potential technical questions.' :
                              app.status === 'Interview' ? 'Research the company and practice common interview questions.' :
                              'Congratulations on reaching this stage!'}
                          </div>
                        </div>
                      )}
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {myApps.map(app => {
          const isWithdrawn = app.status === 'Withdrawn';
          const isRejected = app.status === 'Rejected';
          return (
            <div key={app.id} className={`bg-card rounded-xl border border-border p-4 ${isWithdrawn || isRejected ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{app.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{app.company}</p>
                </div>
                <ScoreBadge score={app.score} size="sm" showLabel={false} />
              </div>
              <StageStepper current={app.status} />
              <div className="flex gap-2 mt-3">
                {isWithdrawn && <Button variant="emeraldOutline" size="xs" onClick={() => setReapplyApp(app.id)}>Re-apply</Button>}
                {!isWithdrawn && !isRejected && app.status !== 'Offer' && <Button variant="ghost" size="xs" className="text-red" onClick={() => setWithdrawApp(app.id)}>Withdraw</Button>}
                {app.status === 'Interview' && app.meetingLink && (
                  <a href={app.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="emerald" size="xs"><Video size={12} /> Join Meeting</Button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {withdrawApp && (() => {
        const app = myApps.find(a => a.id === withdrawApp);
        return app ? <WithdrawDialog open={true} onClose={() => setWithdrawApp(null)} appId={app.id} jobTitle={app.jobTitle} company={app.company} /> : null;
      })()}
      {reapplyApp && (() => {
        const app = myApps.find(a => a.id === reapplyApp);
        return app ? <ReapplyDialog open={true} onClose={() => setReapplyApp(null)} appId={app.id} jobTitle={app.jobTitle} /> : null;
      })()}
    </div>
  );
};

export default MyApplications;
