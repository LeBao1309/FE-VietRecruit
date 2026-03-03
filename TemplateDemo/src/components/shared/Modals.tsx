import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Job, InterviewData, Application } from '@/types';
import { generateGoogleCalendarUrl } from '@/lib/calendarExport';
import { CalendarPlus, Sparkles } from 'lucide-react';
import { loadEmailTemplates, replaceVariables } from '@/lib/emailTemplates';

// ─── Auto-Format JD Helper ───
function autoFormatJD(text: string): string {
  const lines = text.split('\n');
  const formatted = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (/^[•*+]\s/.test(trimmed)) {
      return `- ${trimmed.replace(/^[•*+]\s*/, '')}`;
    }
    if (trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
      if (trimmed.length < 40 && lines.indexOf(line) > 0) {
        return `- ${trimmed}`;
      }
    }
    return trimmed;
  });
  return formatted.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ─── Interview Modal ───
export function InterviewModal({
  open, onClose, appId, candidateName, onCancel
}: {
  open: boolean; onClose: () => void; appId: string; candidateName: string; onCancel?: () => void;
}) {
  const { moveCandidateStage, companyInfo } = useApp();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60m');
  const [format, setFormat] = useState('Video Call');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

  // Pre-fill note from email template when format is Video Call
  useEffect(() => {
    if (open && format === 'Video Call') {
      const tpl = loadEmailTemplates().interview_invitation;
      const filled = replaceVariables(tpl.body, {
        '{candidate_name}': candidateName,
        '{job_title}': 'this position',
        '{company_name}': companyInfo?.name || 'our company',
        '{meeting_link}': link || '(to be provided)',
        '{salary}': '', '{offer_date}': '',
      });
      setNote(filled);
    }
  }, [open, format]);

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = date !== '' && date < today;

  const handleConfirm = () => {
    if (isPastDate) return;
    const data: InterviewData = { date, time: `${time}`, duration, format, meetingLink: link || undefined, noteForCandidate: note || undefined };
    moveCandidateStage(appId, 'Interview', data);
    toast({ title: 'Interview scheduled', description: `${candidateName} · ${date} at ${time} (GMT+7)` });
    onClose();
    setDate(''); setTime('10:00'); setLink(''); setNote('');
  };

  const calendarUrl = date ? generateGoogleCalendarUrl({ title: `Interview — ${candidateName}`, date, time, duration, meetingLink: link || undefined }) : '';

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onCancel?.(); onClose(); } }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview — {candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Interview Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} />
            {isPastDate && <p className="text-xs text-destructive mt-1">⚠ Date cannot be in the past</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Interview Time</label>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">All times displayed in ICT (GMT+7)</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option>30m</option><option>45m</option><option>60m</option><option>90m</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option>Video Call</option><option>Phone</option><option>On-site</option>
              </select>
            </div>
          </div>
          {(format === 'Video Call' || format === 'Phone') && (
            <div>
              <label className="text-sm font-medium block mb-1">Meeting Link</label>
              <Input placeholder="https://meet.google.com/..." value={link} onChange={e => setLink(e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">This link will be shared with the candidate</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">Notes for Candidate</label>
            <Textarea rows={2} placeholder="Optional notes..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => { onCancel?.(); onClose(); }}>← Cancel — Keep in Previous Stage</Button>
          {calendarUrl && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
              <Button type="button" variant="outline" size="sm" className="gap-1">
                <CalendarPlus size={14} /> Add to Google Calendar
              </Button>
            </a>
          )}
          <Button variant="indigo" onClick={handleConfirm} disabled={!date || isPastDate}>Confirm & Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create/Edit Job Modal ───
export function CreateJobModal({
  open, onClose, editJob
}: {
  open: boolean; onClose: () => void; editJob?: Job | null;
}) {
  const { createJob, updateJob } = useApp();
  const { toast } = useToast();
  const isEdit = !!editJob;
  const [title, setTitle] = useState(editJob?.title || '');
  const [department, setDepartment] = useState(editJob?.department || '');
  const [type, setType] = useState<string>(editJob?.type || 'Full-time');
  const [location, setLocation] = useState(editJob?.location || '');
  const [salaryMin, setSalaryMin] = useState(editJob?.salaryMin || 0);
  const [salaryMax, setSalaryMax] = useState(editJob?.salaryMax || 0);
  const [description, setDescription] = useState(editJob?.description || '');
  const [skillsStr, setSkillsStr] = useState(editJob?.skills.join(', ') || '');

  React.useEffect(() => {
    if (editJob) {
      setTitle(editJob.title); setDepartment(editJob.department); setType(editJob.type);
      setLocation(editJob.location); setSalaryMin(editJob.salaryMin); setSalaryMax(editJob.salaryMax);
      setDescription(editJob.description); setSkillsStr(editJob.skills.join(', '));
    } else {
      setTitle(''); setDepartment(''); setType('Full-time'); setLocation('');
      setSalaryMin(0); setSalaryMax(0); setDescription(''); setSkillsStr('');
    }
  }, [editJob, open]);

  const handleSubmit = () => {
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (isEdit && editJob) {
      updateJob({ ...editJob, title, department, type: type as any, location, salaryMin, salaryMax, description, skills });
      toast({ title: 'Job updated', description: 'AI scores recalculating...' });
    } else {
      createJob({ title, company: 'TechViet Corp', department, type: type as any, location, salaryMin, salaryMax, description, skills, postedDays: 0, isActive: true });
      toast({ title: 'Job created', description: 'AI scoring enabled' });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit Job — ${editJob?.title}` : 'Create New Job'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Job Title</label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Department</label><Input value={department} onChange={e => setDepartment(e.target.value)} /></div>
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option>Full-time</option><option>Part-time</option><option>Remote</option><option>Contract</option><option>Hybrid</option><option>On-site</option>
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium block mb-1">Location</label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Salary Min</label><Input type="number" value={salaryMin} onChange={e => setSalaryMin(+e.target.value)} /></div>
            <div><label className="text-sm font-medium block mb-1">Salary Max</label><Input type="number" value={salaryMax} onChange={e => setSalaryMax(+e.target.value)} /></div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium">Job Description</label>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-light text-indigo font-medium">✦ AI</span>
              <button
                type="button"
                onClick={() => setDescription(autoFormatJD(description))}
                className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles size={12} /> Auto-Format
              </button>
            </div>
            <Textarea rows={6} value={description} onChange={e => setDescription(e.target.value)} placeholder="Use - for bullets, ## for subheadings, **bold**" />
            <p className="text-[11px] text-muted-foreground mt-1">AI uses this to score candidate CVs. Supports markdown formatting.</p>
          </div>
          <div><label className="text-sm font-medium block mb-1">Required Skills (comma-separated)</label><Input value={skillsStr} onChange={e => setSkillsStr(e.target.value)} placeholder="React, TypeScript, Node.js" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="indigo" onClick={handleSubmit} disabled={!title}>
            {isEdit ? '✦ Save Changes' : '✦ Create Job & Enable AI Scoring'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Offer Letter Modal ───
const OFFER_TEMPLATES = {
  standard: { label: 'Standard Offer', salaryMultiplier: 1 },
  senior: { label: 'Senior Offer', salaryMultiplier: 1.2 },
  internship: { label: 'Internship', salaryMultiplier: 0.5 },
} as const;

export function OfferLetterModal({
  open, onClose, app, job
}: {
  open: boolean; onClose: () => void; app: Application; job: Job;
}) {
  const { moveCandidateStage, companyInfo } = useApp();
  const { toast } = useToast();
  const [template, setTemplate] = useState<keyof typeof OFFER_TEMPLATES>('standard');

  const salary = Math.round(job.salaryMax * OFFER_TEMPLATES[template].salaryMultiplier);
  const company = companyInfo.name || job.company;

  // Use email template for offer letter
  const tpl = loadEmailTemplates().job_offer;
  const letterText = replaceVariables(tpl.body, {
    '{candidate_name}': app.candidateName,
    '{job_title}': job.title,
    '{company_name}': company,
    '{salary}': `$${salary.toLocaleString()}/month`,
    '{offer_date}': new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{meeting_link}': '',
  });

  const handleSign = () => {
    moveCandidateStage(app.id, 'Offer');
    toast({ title: '🖋️ Offer sent with Digital Signature', description: `${app.candidateName} — $${salary.toLocaleString()}/mo` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Offer Letter — {app.candidateName}</DialogTitle>
          <DialogDescription>Select a template and review the offer before sending.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Select Template</label>
            <div className="flex gap-2">
              {(Object.keys(OFFER_TEMPLATES) as (keyof typeof OFFER_TEMPLATES)[]).map(k => (
                <button
                  key={k}
                  onClick={() => setTemplate(k)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    template === k ? 'border-indigo bg-indigo-light text-indigo' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {OFFER_TEMPLATES[k].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Preview</label>
            <div className="bg-secondary rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line border border-border font-serif max-h-[300px] overflow-y-auto">
              {letterText}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="indigo" onClick={handleSign}>🖋️ Sign & Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Guest Apply Modal ───
export function GuestApplyModal({
  open, onClose, jobId, jobTitle
}: {
  open: boolean; onClose: () => void; jobId: string; jobTitle: string;
}) {
  const { guestApply } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvUploaded, setCvUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [predictedScore, setPredictedScore] = useState<number | null>(null);

  const handleCvUpload = () => {
    setAnalyzing(true);
    setPredictedScore(null);
    setTimeout(() => {
      setCvUploaded(true);
      setAnalyzing(false);
      if (!email) setEmail('guest@extracted.com');
      if (!phone) setPhone('+84 900 000 000');
      const mockScore = Math.floor(Math.random() * 36) + 60;
      setPredictedScore(mockScore);
      toast({ title: '📄 CV parsed', description: 'Email and phone extracted automatically.' });
    }, 3000);
  };

  const handleSubmit = () => {
    guestApply(jobId, name, email, phone);
    // Simulate auto-reply email
    const tpl = loadEmailTemplates().application_received;
    const emailBody = replaceVariables(tpl.subject, {
      '{candidate_name}': name, '{job_title}': jobTitle,
      '{company_name}': 'TechViet Corp', '{salary}': '', '{meeting_link}': '', '{offer_date}': '',
    });
    setTimeout(() => {
      toast({ title: '📧 Auto-reply sent', description: emailBody });
    }, 1000);
    setSubmitted(true);
  };

  const resetState = () => { setName(''); setEmail(''); setPhone(''); setCvUploaded(false); setSubmitted(false); setAnalyzing(false); setPredictedScore(null); };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={() => { onClose(); resetState(); }}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">🎉</div>
            <DialogTitle>Application Sent!</DialogTitle>
            <p className="text-sm text-muted-foreground">Check your email at <span className="font-medium text-foreground">{email}</span> for confirmation.</p>
            <Button variant="indigo" onClick={() => { onClose(); resetState(); }}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Apply as Guest</DialogTitle>
          <DialogDescription>Apply to {jobTitle} without creating an account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Predicted Match Score Banner */}
          {predictedScore !== null && (
            <div className={`p-3 rounded-lg border text-sm font-medium text-center ${
              predictedScore >= 80
                ? 'bg-emerald-light border-emerald/20 text-emerald-dark'
                : predictedScore >= 50
                ? 'bg-amber-light border-amber/20 text-amber-dark'
                : 'bg-red-light border-red/20 text-red-dark'
            }`}>
              🎉 {predictedScore >= 80 ? 'Great' : predictedScore >= 50 ? 'Good' : 'Fair'} match! Your CV scores <span className="font-mono-num font-bold">{predictedScore}%</span> for this role.
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">Full Name <span className="text-destructive">*</span></label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email <span className="text-destructive">*</span></label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone <span className="text-destructive">*</span></label>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+84 ..." />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Upload CV</label>
            {analyzing ? (
              <div className="p-3 rounded-lg border border-indigo/20 bg-indigo-light">
                <div className="flex items-center gap-2 text-xs text-indigo font-medium mb-2">
                  <span className="animate-spin">⏳</span> Analyzing your CV...
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-indigo rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : cvUploaded ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-light border border-emerald/20 text-xs text-emerald-dark font-medium">
                ✅ CV uploaded and parsed
              </div>
            ) : (
              <button
                onClick={handleCvUpload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-indigo transition-colors"
              >
                📎 Click to upload CV (PDF)
              </button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="emerald" onClick={handleSubmit} disabled={!name || !email || !phone}>
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Candidate CV Upload Modal (for logged-in candidates without CV) ───
export function CandidateCVUploadModal({
  open, onClose, jobTitle, onComplete
}: {
  open: boolean; onClose: () => void; jobTitle?: string; onComplete?: () => void;
}) {
  const { setHasCV, profile, updateProfile } = useApp();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(1);
  const [done, setDone] = useState(false);

  const handleUpload = () => {
    setAnalyzing(true);
    setAnalyzeStep(1);
    const stepInterval = setInterval(() => setAnalyzeStep(s => Math.min(s + 1, 3)), 1000);
    setTimeout(() => {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setDone(true);
      setHasCV(true);
      const extracted = ['Docker', 'AWS', 'CI/CD'];
      const updatedSkills = [...new Set([...profile.skills, ...extracted])];
      updateProfile({ ...profile, skills: updatedSkills });
      toast({ title: '📄 CV analyzed', description: 'Skills extracted and profile updated.' });
    }, 3000);
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
    setDone(false);
    setAnalyzing(false);
    setAnalyzeStep(1);
  };

  const resetAndClose = () => {
    onClose();
    setDone(false);
    setAnalyzing(false);
    setAnalyzeStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{jobTitle ? `Upload CV to Apply for ${jobTitle}` : 'Upload Your CV'}</DialogTitle>
          <DialogDescription>AI will extract your skills and experience automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-sm font-semibold">CV analyzed successfully!</p>
              <p className="text-xs text-muted-foreground">Your profile has been updated with extracted skills.</p>
              {jobTitle && (
                <div className="p-3 rounded-lg bg-emerald-light border border-emerald/20 text-sm font-medium text-emerald-dark">
                  🎉 Ready to apply — clicking below will submit your application.
                </div>
              )}
            </div>
          ) : analyzing ? (
            <div className="p-4 rounded-xl border border-indigo/20 bg-indigo-light">
              <div className="flex items-center gap-2 text-xs text-indigo font-medium mb-3">
                <span className="animate-spin">⏳</span> Analyzing your CV...
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden mb-2">
                <div className="h-full bg-indigo rounded-full animate-pulse" style={{ width: `${(analyzeStep / 3) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground font-mono-num">
                Step {analyzeStep}/3: {analyzeStep === 1 ? 'Scanning text...' : analyzeStep === 2 ? 'Identifying Skills...' : 'Calculating Match...'}
              </p>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="w-full flex flex-col items-center gap-3 px-4 py-8 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-indigo transition-colors"
            >
              <span className="text-4xl">📂</span>
              <span className="text-sm font-medium">Click to upload your CV (PDF)</span>
              <span className="text-[11px] text-muted-foreground">AI will auto-fill your skills and experience</span>
            </button>
          )}
        </div>
        <DialogFooter>
          {done ? (
            <Button variant="emerald" onClick={handleFinish} className="w-full">
              {jobTitle ? '🚀 Submit Application' : '✓ Done'}
            </Button>
          ) : (
            <Button variant="ghost" onClick={resetAndClose}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rejection Modal (Enhanced) ───
const REJECTION_REASONS = [
  'Skillset mismatch',
  'Experience too low',
  'Salary expectations',
  'Culture fit',
  'Position filled',
] as const;

function getPreviewMessage(reason: string, candidateName: string, jobTitle: string, companyName: string): string {
  const tpl = loadEmailTemplates().rejection;
  return replaceVariables(tpl.body, {
    '{candidate_name}': candidateName,
    '{job_title}': jobTitle,
    '{company_name}': companyName,
    '{salary}': '', '{meeting_link}': '', '{offer_date}': '',
  });
}

export function RejectionModal({
  open, onClose, appId, candidateName
}: {
  open: boolean; onClose: () => void; appId: string; candidateName: string;
}) {
  const { rejectCandidate, moveCandidateStage, companyInfo } = useApp();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Decline Candidate — {candidateName}</DialogTitle>
          <DialogDescription>Provide a reason and optional feedback for this decision.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Reason <span className="text-destructive">*</span></label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">Select reason...</option>
              {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Feedback Note <span className="text-muted-foreground text-xs">(Optional)</span></label>
            <Textarea rows={2} placeholder="Internal note for future reference..." value={feedbackNote} onChange={e => setFeedbackNote(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendNotification} onChange={e => setSendNotification(e.target.checked)} className="rounded" />
              Send rejection feedback to candidate
            </label>
            {sendNotification && reason && (
              <div className="p-3 bg-muted rounded-lg border border-border text-xs text-muted-foreground">
                <p className="font-medium text-foreground text-[11px] mb-1">Preview — Candidate will see:</p>
                <p className="italic whitespace-pre-line">{getPreviewMessage(reason, candidateName, 'this position', companyInfo?.name || 'our company')}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={!reason} onClick={() => {
            rejectCandidate(appId, reason, sendNotification);
            const undoTimeout = setTimeout(() => {}, 4000);
            toast({
              title: 'Candidate declined',
              description: sendNotification ? 'Notification sent to candidate.' : undefined,
              action: (
                <ToastAction altText="Undo rejection" onClick={() => {
                  clearTimeout(undoTimeout);
                  moveCandidateStage(appId, 'Applied');
                  toast({ title: 'Action undone', description: `${candidateName} restored.` });
                }}>
                  Undo
                </ToastAction>
              ),
            });
            onClose();
            setReason(''); setFeedbackNote(''); setSendNotification(true);
          }}>Confirm Decline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Withdraw Dialog ───
export function WithdrawDialog({
  open, onClose, appId, jobTitle, company
}: {
  open: boolean; onClose: () => void; appId: string; jobTitle: string; company: string;
}) {
  const { withdrawApplication } = useApp();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Withdraw Application?</DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw from {jobTitle} at {company}? This will notify the recruiter. You may re-apply later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => {
            withdrawApplication(appId);
            toast({ title: 'Application withdrawn' });
            onClose();
          }}>Withdraw Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reapply Dialog ───
export function ReapplyDialog({
  open, onClose, appId, jobTitle
}: {
  open: boolean; onClose: () => void; appId: string; jobTitle: string;
}) {
  const { reapplyApplication } = useApp();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Re-apply to {jobTitle}?</DialogTitle>
          <DialogDescription>Your application will be reset to "Applied" status.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="emerald" onClick={() => {
            reapplyApplication(appId);
            toast({ title: 'Re-applied successfully' });
            onClose();
          }}>Re-apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
