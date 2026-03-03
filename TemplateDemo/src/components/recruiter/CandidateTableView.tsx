import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Job, Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import PaginationControls from '@/components/shared/PaginationControls';
import ScoreBadge, { ScoreBar, getScoreColor } from '@/components/shared/ScoreBadge';
import { InterviewModal, RejectionModal, OfferLetterModal } from '@/components/shared/Modals';
import ScorecardModal from '@/components/shared/ScorecardModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Pencil, X, Mail, ArrowRight, FileText, Brain, MessageSquare, Star, Send, ClipboardCheck, Download, Link2, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { highlightKeywords, formatTimeAgo, formatFullDate, exportToCsv } from '@/lib/textHelpers';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface Props { job: Job; onEditJob: (j: Job) => void; }

const CandidateTableView: React.FC<Props> = ({ job, onEditJob }) => {
  const { applications, kanbanSearch, setPage, moveCandidateStage, updatePrivateNotes, addScorecard, addActivityComment, getActivitiesForApp, getScorecardForApp, blacklistCandidate, settings } = useApp();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'cv' | 'activity'>('ai');
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [rejectApp, setRejectApp] = useState<Application | null>(null);
  const [offerApp, setOfferApp] = useState<Application | null>(null);
  const [scorecardApp, setScorecardApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [commentDraft, setCommentDraft] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const jobApps = applications.filter(a => a.jobId === job.id);
  const filtered = jobApps.filter(a => {
    if (!kanbanSearch) return true;
    const q = kanbanSearch.toLowerCase();
    return a.candidateName.toLowerCase().includes(q) || a.candidateSkills.some(s => s.toLowerCase().includes(q));
  });
  const sorted = [...filtered].sort((a, b) => sortBy === 'score' ? b.score - a.score : 0);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openDrawer = (app: Application) => {
    setSelectedApp(app);
    setActiveTab('ai');
    setCommentDraft('');
  };

  const handleMoveFromDrawer = (status: string) => {
    if (!selectedApp) return;
    if (status === 'Interview') {
      setInterviewApp(selectedApp);
    } else if (status === 'Offer') {
      setOfferApp(selectedApp);
    } else {
      moveCandidateStage(selectedApp.id, status);
      toast({ title: `Moved to ${status}` });
    }
  };

  const handleSendComment = () => {
    if (!selectedApp || !commentDraft.trim()) return;
    addActivityComment({
      appId: selectedApp.id, type: 'comment',
      message: commentDraft.trim(), author: 'HR Admin',
      timestamp: new Date().toISOString(),
    });
    setCommentDraft('');
  };

  const scorecard = selectedApp ? getScorecardForApp(selectedApp.id) : undefined;
  const activities = selectedApp ? getActivitiesForApp(selectedApp.id) : [];

  // Build system events from timeline
  const timelineEvents = selectedApp ? selectedApp.timeline.map((t, i) => ({
    id: `tl_${i}`, appId: selectedApp.id, type: 'system' as const,
    message: `${t.status}${t.message ? ` — ${t.message}` : ''}`,
    timestamp: new Date(Date.parse(t.date) || Date.now()).toISOString(),
  })) : [];

  const allActivities = [...timelineEvents, ...activities].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Mock CV text for keyword highlighting
  const mockCvText = selectedApp
    ? `${selectedApp.candidateName}\n${selectedApp.candidateEmail}\n\nSummary: Experienced developer with ${selectedApp.candidateExperience} years of experience.\n\nSkills: ${selectedApp.candidateSkills.join(', ')}\n\nExperience working with ${selectedApp.candidateSkills.slice(0, 3).join(', ')} in production environments. Built scalable applications using modern frameworks and cloud services like AWS and Docker.`
    : '';

  const [exportingCsv, setExportingCsv] = useState(false);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    await new Promise(r => setTimeout(r, 1500));
    const headers = ['Name', 'Email', 'Experience', 'AI Score', 'Status', 'Applied Date', 'Skills'];
    const rows = sorted.map(a => [a.candidateName, a.candidateEmail, `${a.candidateExperience}yr`, `${a.score}%`, a.status, a.appliedDate, a.candidateSkills.join('; ')]);
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`candidates_export_${dateStr}.csv`, headers, rows);
    toast({ title: '📥 Export successful' });
    setExportingCsv(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://talentos.app/c/${selectedApp?.id || 'unknown'}`);
    toast({ title: '🔗 Link copied to clipboard' });
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="animate-fade-up">
      <button onClick={() => setPage('recruiter-jobs')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 min-w-10 min-h-10">
        <ArrowLeft size={14} /> Back to Jobs
      </button>
      <div className="text-xs text-muted-foreground mb-4">Jobs / {job.title} / Candidates</div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-heading">Candidates</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportCsv} disabled={exportingCsv}>{exportingCsv ? '⏳ Preparing...' : <><Download size={14} /> Export CSV</>}</Button>
          <button onClick={() => onEditJob(job)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"><Pencil size={14} /></button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No candidates found{kanbanSearch && ` matching '${kanbanSearch}'`}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Candidate</th>
                  <th className="text-left px-4 py-3 font-medium">Applied</th>
                  <th className="text-left px-4 py-3 font-medium">Experience</th>
                  <th className="text-left px-4 py-3 font-medium cursor-pointer" onClick={() => setSortBy('score')}>AI Score ↕</th>
                  <th className="text-left px-4 py-3 font-medium">Human</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(app => {
                  const sc = getScorecardForApp(app.id);
                  return (
                    <tr key={app.id} onClick={() => openDrawer(app)} className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-light text-indigo text-xs font-bold flex items-center justify-center">
                            {app.candidateName.split(' ').slice(-1)[0]?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{app.candidateName}</p>
                            <p className="text-[10px] text-muted-foreground">{app.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono-num text-xs">{app.appliedDate}</td>
                      <td className="px-4 py-3 font-mono-num text-xs">{app.candidateExperience}yr</td>
                      <td className="px-4 py-3"><ScoreBadge score={app.score} showLabel={false} updated={app.scoreUpdated} /></td>
                      <td className="px-4 py-3">
                        {sc ? (
                          <span className="flex items-center gap-0.5 text-xs font-mono-num text-amber-dark">
                            <Star size={12} className="fill-amber text-amber" /> {sc.rating}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          app.status === 'Applied' ? 'bg-secondary' :
                          app.status === 'Screening' ? 'bg-amber-light text-amber-dark' :
                          app.status === 'Interview' ? 'bg-indigo-light text-indigo' :
                          app.status === 'Offer' ? 'bg-emerald-light text-emerald-dark' :
                          app.status === 'Rejected' ? 'bg-red-light text-red-dark' :
                          'bg-secondary text-muted-foreground'
                        }`}>{app.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="indigoOutline" size="xs" onClick={e => { e.stopPropagation(); openDrawer(app); }}>View AI →</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginated.map(app => (
              <button key={app.id} onClick={() => openDrawer(app)} className="w-full bg-card rounded-xl border border-border p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-light text-indigo text-xs font-bold flex items-center justify-center">{app.candidateName[0]}</div>
                    <div><p className="text-sm font-medium">{app.candidateName}</p><p className="text-[10px] text-muted-foreground">{app.candidateExperience}yr exp</p></div>
                  </div>
                  <ScoreBadge score={app.score} showLabel={false} />
                </div>
                <ScoreBar score={app.score} className="mt-2" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Smart Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto p-0">
          {selectedApp && (
            <>
              <div className="p-6">
                <SheetHeader>
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-xs text-muted-foreground">← Back to Candidates</div>
                     <button onClick={handleCopyLink} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary" title="Copy link"><Link2 size={14} /></button>
                   </div>
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-light text-indigo flex items-center justify-center text-lg font-bold">
                      {selectedApp.candidateName.split(' ').slice(-1)[0]?.[0]}
                    </div>
                    <div>
                      <SheetTitle>{selectedApp.candidateName}</SheetTitle>
                      <p className="text-xs text-muted-foreground">{selectedApp.candidateEmail} · {selectedApp.candidatePhone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getScoreColor(selectedApp.score).bg} ${getScoreColor(selectedApp.score).text}`}>
                          {selectedApp.status}
                        </span>
                        {scorecard && (
                          <span className="flex items-center gap-0.5 text-[10px] font-mono-num text-amber-dark">
                            <Star size={10} className="fill-amber text-amber" /> {scorecard.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                {/* Scorecard Button */}
                {selectedApp.status === 'Interview' && !scorecard && (
                  <button
                    onClick={() => setScorecardApp(selectedApp)}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-indigo text-indigo text-sm font-medium hover:bg-indigo-light transition-colors"
                  >
                    <ClipboardCheck size={16} /> Fill Scorecard
                  </button>
                )}

                {/* Scorecard Summary */}
                {scorecard && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-light/50 border border-amber/20 space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} className="fill-amber text-amber" /> Scorecard: {scorecard.rating}/5 — <span className={scorecard.recommendation === 'No Hire' ? 'text-red-dark' : 'text-emerald-dark'}>{scorecard.recommendation}</span>
                    </div>
                    {scorecard.pros && <p className="text-[11px] text-muted-foreground">👍 {scorecard.pros}</p>}
                    {scorecard.cons && <p className="text-[11px] text-muted-foreground">👎 {scorecard.cons}</p>}
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-border mb-4">
                  {[
                    { id: 'ai' as const, label: '🤖 AI Analysis' },
                    { id: 'cv' as const, label: '📄 CV' },
                    { id: 'activity' as const, label: '💬 Activity' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 text-xs font-medium transition-colors border-b-2 ${
                        activeTab === tab.id ? 'border-indigo text-indigo' : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >{tab.label}</button>
                  ))}
                </div>

                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <svg viewBox="0 0 80 80" className="w-20 h-20">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none"
                          stroke={selectedApp.score >= 80 ? 'hsl(var(--emerald))' : selectedApp.score >= 50 ? 'hsl(var(--amber))' : 'hsl(var(--red))'}
                          strokeWidth="6" strokeDasharray={`${(selectedApp.score / 100) * 213.6} 213.6`}
                          strokeLinecap="round" transform="rotate(-90 40 40)" />
                        <text x="40" y="44" textAnchor="middle" className="text-base font-bold fill-foreground" style={{ fontFamily: 'DM Mono' }}>{selectedApp.score}%</text>
                      </svg>
                      <div className="space-y-1 text-xs">
                        <p className="font-medium">Skills Match: <span className="font-mono-num">{Math.min(100, selectedApp.score + 5)}%</span></p>
                        <p className="font-medium">Experience: <span className="font-mono-num">{Math.min(100, selectedApp.score - 3)}%</span></p>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-dark italic">Score updated based on candidate's latest profile</p>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold">Why this score?</h4>
                      {selectedApp.candidateSkills.filter(s => job.skills.some(js => js.toLowerCase() === s.toLowerCase())).map(s => (
                        <div key={s} className="flex items-center gap-2 text-xs"><span className="text-emerald">✅</span> {s} — matches requirement</div>
                      ))}
                      {job.skills.filter(s => !selectedApp.candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())).map(s => (
                        <div key={s} className="flex items-center gap-2 text-xs"><span className="text-red">❌</span> {s} — not found in profile</div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Keywords Found</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.candidateSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-light text-indigo text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cv' && (
                  <div className="space-y-3">
                    <div className="bg-secondary rounded-xl p-6 text-sm leading-relaxed whitespace-pre-line">
                      {highlightKeywords(mockCvText)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">📥 Download PDF</Button>
                      <Button variant="outline" size="sm">🔗 Open in Viewer</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    {/* Cross-Application Visibility */}
                    {(() => {
                      const otherApps = applications.filter(a => a.candidateId === selectedApp.candidateId && a.id !== selectedApp.id);
                      return (
                        <div className="p-2.5 rounded-lg bg-secondary border border-border text-xs">
                          <p className="font-medium text-[11px] mb-1">📋 Application History</p>
                          {otherApps.length > 0 ? (
                            <p className="text-muted-foreground">Also applied to: {otherApps.map((a, i) => (
                              <span key={a.id}>{i > 0 && ', '}<span className="font-medium text-foreground">{a.jobTitle}</span> ({a.status})</span>
                            ))}</p>
                          ) : (
                            <p className="text-muted-foreground">No other concurrent applications.</p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="bg-amber-light rounded-lg p-2 text-[11px] text-amber-dark">
                      Internal activity log. Only visible to recruiters.
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3 max-h-[360px] overflow-y-auto">
                      {allActivities.map(a => (
                        <div key={a.id} className={`flex gap-2 ${a.type === 'system' ? '' : ''}`}>
                          {a.type === 'system' ? (
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <ArrowRight size={10} className="text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-light text-indigo flex items-center justify-center shrink-0 text-[9px] font-bold">
                              {a.author?.[0] || 'R'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {a.type === 'comment' && (
                              <p className="text-[10px] font-medium text-foreground">{a.author}</p>
                            )}
                            <p className={`text-xs ${a.type === 'system' ? 'text-muted-foreground italic' : 'bg-secondary rounded-lg px-3 py-2'}`}>
                              {a.message}
                            </p>
                            <Tooltip><TooltipTrigger asChild><p className="text-[9px] text-muted-foreground font-mono-num mt-0.5 cursor-default">{formatTimeAgo(a.timestamp)}</p></TooltipTrigger><TooltipContent>{formatFullDate(a.timestamp)}</TooltipContent></Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Input
                        placeholder="Add a comment..."
                        value={commentDraft}
                        onChange={e => setCommentDraft(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                        className="flex-1 h-9 text-xs"
                      />
                      <Button variant="indigo" size="sm" onClick={handleSendComment} disabled={!commentDraft.trim()}>
                        <Send size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="destructive" size="sm" onClick={() => { setRejectApp(selectedApp); }}>
                    <X size={14} /> Reject
                  </Button>
                  <Button variant="outline" size="sm"><Mail size={14} /> Email</Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => {
                      blacklistCandidate(selectedApp.id);
                      toast({ title: selectedApp.isBlacklisted ? 'Removed from blacklist' : '🚫 Candidate blacklisted' });
                    }}
                  >
                    <Ban size={14} /> {selectedApp.isBlacklisted ? 'Unblacklist' : 'Blacklist'}
                  </Button>
                  {selectedApp.status !== 'Interview' && selectedApp.status !== 'Offer' && selectedApp.status !== 'Rejected' && selectedApp.status !== 'Withdrawn' && (
                    <Button variant="indigo" size="sm" onClick={() => handleMoveFromDrawer('Interview')}>
                      <ArrowRight size={14} /> Move to Interview
                    </Button>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Or move to stage:</span>
                  <select
                    value={selectedApp.status}
                    onChange={e => handleMoveFromDrawer(e.target.value)}
                    className="w-full h-8 mt-1 rounded-lg border border-input bg-background px-3 text-xs"
                    disabled={selectedApp.status === 'Withdrawn' || selectedApp.status === 'Rejected'}
                  >
                    {['Applied', 'Screening', 'Interview', 'Offer'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {interviewApp && (
        <InterviewModal open={true} onClose={() => setInterviewApp(null)} appId={interviewApp.id} candidateName={interviewApp.candidateName} />
      )}
      {rejectApp && (
        <RejectionModal open={true} onClose={() => setRejectApp(null)} appId={rejectApp.id} candidateName={rejectApp.candidateName} />
      )}
      {offerApp && (
        <OfferLetterModal open={true} onClose={() => setOfferApp(null)} app={offerApp} job={job} />
      )}
      {scorecardApp && (
        <ScorecardModal
          open={true}
          onClose={() => setScorecardApp(null)}
          candidateName={scorecardApp.candidateName}
          onSubmit={data => {
            addScorecard({
              appId: scorecardApp.id, ...data,
              createdAt: new Date().toISOString(), recruiterName: 'HR Admin',
            });
            toast({ title: '✅ Scorecard submitted', description: `★ ${data.rating}/5 — ${data.recommendation}` });
          }}
        />
      )}
    </div>
    </TooltipProvider>
  );
};

export default CandidateTableView;
