import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Role, Job, Application, Profile, AppNotification, Settings, InterviewData, CompanyInfo, Scorecard, ActivityComment } from '@/types';
import { defaultJobs, defaultApplications, defaultProfile, defaultNotifications, defaultSettings, CURRENT_CANDIDATE_ID } from '@/data/mockData';
import { ensureBulkData } from '@/data/bulkDataGenerator';

interface AppContextType {
  role: Role | null;
  page: string;
  jobs: Job[];
  applications: Application[];
  profile: Profile;
  notifications: AppNotification[];
  settings: Settings;
  hasCV: boolean;
  selectedJobId: string | null;
  selectedCandidateAppId: string | null;
  kanbanSearch: string;
  companyInfo: CompanyInfo;
  scorecards: Scorecard[];
  activityComments: ActivityComment[];
  login: (role: Role) => void;
  logout: () => void;
  setPage: (page: string) => void;
  setSelectedJobId: (id: string | null) => void;
  setSelectedCandidateAppId: (id: string | null) => void;
  setKanbanSearch: (q: string) => void;
  applyToJob: (jobId: string) => void;
  guestApply: (jobId: string, name: string, email: string, phone: string) => void;
  withdrawApplication: (appId: string) => void;
  reapplyApplication: (appId: string) => void;
  moveCandidateStage: (appId: string, status: string, interviewData?: InterviewData) => void;
  rejectCandidate: (appId: string, reason: string, sendEmail: boolean) => void;
  updateProfile: (p: Profile) => void;
  createJob: (j: Omit<Job, 'id'>) => void;
  updateJob: (j: Job) => void;
  toggleJobActive: (jobId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (s: Settings) => void;
  setHasCV: (v: boolean) => void;
  updatePrivateNotes: (appId: string, notes: string) => void;
  recalculateScores: () => void;
  addNotification: (n: Omit<AppNotification, 'id'>) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  addScorecard: (s: Scorecard) => void;
  addActivityComment: (c: Omit<ActivityComment, 'id'>) => void;
  getActivitiesForApp: (appId: string) => ActivityComment[];
  getScorecardForApp: (appId: string) => Scorecard | undefined;
  blacklistCandidate: (appId: string) => void;
  deleteJob: (jobId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function calculateScore(candidateSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 50;
  const matched = candidateSkills.filter(s =>
    jobSkills.some(js => js.toLowerCase() === s.toLowerCase())
  ).length;
  const base = Math.round((matched / jobSkills.length) * 100);
  return Math.min(100, Math.max(5, base + Math.floor(Math.random() * 6) - 3));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    const stored = localStorage.getItem('talentos_role');
    return (stored === 'candidate' || stored === 'recruiter') ? stored : null;
  });
  const [page, setPageState] = useState(() => loadState('talentos_page', 'landing'));
  const [jobs, setJobs] = useState<Job[]>(() => loadState('talentos_jobs', defaultJobs));
  const [applications, setApplications] = useState<Application[]>(() => loadState('talentos_applications', defaultApplications));
  const [profile, setProfile] = useState<Profile>(() => loadState('talentos_profile', defaultProfile));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadState('talentos_notifications', defaultNotifications));
  const [settings, setSettingsState] = useState<Settings>(() => loadState('talentos_settings', defaultSettings));
  const [hasCV, setHasCVState] = useState(() => localStorage.getItem('talentos_hasCV') === 'true');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidateAppId, setSelectedCandidateAppId] = useState<string | null>(null);
  const [kanbanSearch, setKanbanSearch] = useState('');
  const defaultCompanyInfo: CompanyInfo = { name: 'TechViet Corp', website: '', logoUrl: '', about: '' };
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => loadState('talentos_companyInfo', defaultCompanyInfo));

  const defaultSeedComments: ActivityComment[] = [
    { id: 'ac_seed_1', appId: 'a1', type: 'comment', message: 'Looks promising, strong React skills.', author: 'HR Admin', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'ac_seed_2', appId: 'a1', type: 'comment', message: 'Scheduled interview for Monday.', author: 'HR Admin', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ac_seed_3', appId: 'a1', type: 'system', message: 'Moved to Interview stage', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];
  const [scorecards, setScorecards] = useState<Scorecard[]>(() => loadState('talentos_scorecards', []));
  const [activityComments, setActivityComments] = useState<ActivityComment[]>(() => loadState('talentos_activityComments', defaultSeedComments));

  // Persist effects
  useEffect(() => { if (role) localStorage.setItem('talentos_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('talentos_page', JSON.stringify(page)); }, [page]);
  useEffect(() => { localStorage.setItem('talentos_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('talentos_applications', JSON.stringify(applications)); }, [applications]);
  useEffect(() => { localStorage.setItem('talentos_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('talentos_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('talentos_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('talentos_hasCV', hasCV ? 'true' : 'false'); }, [hasCV]);
  useEffect(() => { localStorage.setItem('talentos_companyInfo', JSON.stringify(companyInfo)); }, [companyInfo]);
  useEffect(() => { localStorage.setItem('talentos_scorecards', JSON.stringify(scorecards)); }, [scorecards]);
  useEffect(() => { localStorage.setItem('talentos_activityComments', JSON.stringify(activityComments)); }, [activityComments]);

  // Bulk data generation on first load
  useEffect(() => {
    ensureBulkData(jobs, applications, setJobs, setApplications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPage = useCallback((p: string) => setPageState(p), []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id'>) => {
    setNotifications(prev => [{ ...n, id: `n_${Date.now()}` }, ...prev]);
  }, []);

  const login = useCallback((r: Role) => {
    setRole(r);
    setPageState(r === 'candidate' ? 'browse-jobs' : 'recruiter-dashboard');
  }, []);

  const logout = useCallback(() => {
    // Preserve global public data (jobs, bulk flag) across logout
    const preserveKeys = ['talentos_jobs', 'talentos_bulkGenerated'];
    Object.keys(localStorage)
      .filter(k => k.startsWith('talentos_') && !preserveKeys.includes(k))
      .forEach(k => localStorage.removeItem(k));
    setRole(null);
    setPageState('browse-jobs');
    // Keep current jobs — they are global public data
    setApplications(defaultApplications);
    setProfile(defaultProfile);
    setNotifications(defaultNotifications);
    setSettingsState(defaultSettings);
    setHasCVState(false);
  }, []);

  const applyToJob = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const existing = applications.find(a => a.candidateId === CURRENT_CANDIDATE_ID && a.jobId === jobId && a.status !== 'Withdrawn');
    if (existing) return;
    const score = calculateScore(profile.skills, job.skills);
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newApp: Application = {
      id: `a_${Date.now()}`, candidateId: CURRENT_CANDIDATE_ID,
      candidateName: profile.name, candidateEmail: profile.email,
      candidatePhone: profile.phone, candidateAvatar: '',
      candidateExperience: profile.experiences.length > 0 ? 5 : 1,
      candidateSkills: [...profile.skills],
      jobId, jobTitle: job.title, company: job.company,
      status: 'Applied', score, appliedDate: now, lastUpdate: now,
      timeline: [{ status: 'Applied', date: now }], privateNotes: '',
    };
    setApplications(prev => [...prev, newApp]);
    addNotification({
      recipientRole: 'recruiter', message: `New application from ${profile.name}`,
      timestamp: new Date().toISOString(), isRead: false, type: 'new_application',
      metadata: { jobTitle: job.title, candidateName: profile.name },
    });
  }, [jobs, applications, profile, addNotification]);

  const guestApply = useCallback((jobId: string, name: string, email: string, phone: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newApp: Application = {
      id: `a_guest_${Date.now()}`, candidateId: `guest_${Date.now()}`,
      candidateName: name, candidateEmail: email,
      candidatePhone: phone, candidateAvatar: '',
      candidateExperience: 0,
      candidateSkills: [],
      jobId, jobTitle: job.title, company: job.company,
      status: 'Applied', score: 50, appliedDate: now, lastUpdate: now,
      timeline: [{ status: 'Applied', date: now, message: 'Guest application' }],
      privateNotes: '', isGuest: true,
    };
    setApplications(prev => [...prev, newApp]);
    addNotification({
      recipientRole: 'recruiter', message: `New guest application from ${name}`,
      timestamp: new Date().toISOString(), isRead: false, type: 'new_application',
      metadata: { jobTitle: job.title, candidateName: name },
    });
  }, [jobs, addNotification]);

  const withdrawApplication = useCallback((appId: string) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return { ...a, status: 'Withdrawn' as const, lastUpdate: now,
        timeline: [...a.timeline, { status: 'Withdrawn', date: now, message: 'Withdrawn by candidate' }] };
    }));
    const app = applications.find(a => a.id === appId);
    if (app) {
      addNotification({
        recipientRole: 'recruiter', message: `${app.candidateName} withdrew their application`,
        timestamp: new Date().toISOString(), isRead: false, type: 'withdrawal',
        metadata: { jobTitle: app.jobTitle, candidateName: app.candidateName },
      });
    }
  }, [applications, addNotification]);

  const reapplyApplication = useCallback((appId: string) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return { ...a, status: 'Applied' as const, appliedDate: now, lastUpdate: now,
        timeline: [{ status: 'Applied', date: now, message: 'Re-applied' }],
        interviewDate: undefined, interviewTime: undefined, meetingLink: undefined };
    }));
    const app = applications.find(a => a.id === appId);
    if (app) {
      addNotification({
        recipientRole: 'recruiter', message: `${app.candidateName} re-applied to ${app.jobTitle}`,
        timestamp: new Date().toISOString(), isRead: false, type: 'reapply',
        metadata: { jobTitle: app.jobTitle, candidateName: app.candidateName },
      });
    }
  }, [applications, addNotification]);

  const moveCandidateStage = useCallback((appId: string, status: string, interviewData?: InterviewData) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const updated: Application = {
        ...a, status: status as Application['status'], lastUpdate: now,
        timeline: [...a.timeline, { status, date: now }],
      };
      if (interviewData) {
        updated.interviewDate = interviewData.date;
        updated.interviewTime = interviewData.time;
        updated.interviewDuration = interviewData.duration;
        updated.interviewFormat = interviewData.format;
        updated.meetingLink = interviewData.meetingLink;
        updated.candidateNote = interviewData.noteForCandidate;
      }
      return updated;
    }));
    const app = applications.find(a => a.id === appId);
    if (app) {
      if (status === 'Interview' && interviewData) {
        addNotification({
          recipientRole: 'candidate',
          message: `Interview scheduled ${interviewData.date} at ${interviewData.time} (GMT+7)`,
          timestamp: new Date().toISOString(), isRead: false, type: 'interview_scheduled',
          metadata: { jobTitle: app.jobTitle, meetingLink: interviewData.meetingLink, interviewDate: interviewData.date },
        });
      } else if (status === 'Screening') {
        addNotification({
          recipientRole: 'candidate', message: `Your application is under review`,
          timestamp: new Date().toISOString(), isRead: false, type: 'status_change',
          metadata: { jobTitle: app.jobTitle },
        });
      } else if (status === 'Offer') {
        addNotification({
          recipientRole: 'candidate', message: `🎉 You have received an offer!`,
          timestamp: new Date().toISOString(), isRead: false, type: 'offer',
          metadata: { jobTitle: app.jobTitle },
        });
      }
    }
  }, [applications, addNotification]);

  const rejectCandidate = useCallback((appId: string, reason: string, sendNotification: boolean) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return { ...a, status: 'Rejected' as const, rejectionReason: reason, lastUpdate: now,
        timeline: [...a.timeline, { status: 'Rejected', date: now, message: reason }] };
    }));
    const app = applications.find(a => a.id === appId);
    if (app && sendNotification) {
      addNotification({
        recipientRole: 'candidate',
        message: `Update on your application for ${app.jobTitle}`,
        timestamp: new Date().toISOString(), isRead: false, type: 'rejection',
        metadata: { jobTitle: app.jobTitle },
      });
    }
  }, [applications, addNotification]);

  const updateProfile = useCallback((p: Profile) => {
    setProfile(p);
    setApplications(prev => prev.map(a => {
      if (a.candidateId !== CURRENT_CANDIDATE_ID || a.status === 'Withdrawn' || a.status === 'Rejected') return a;
      const job = jobs.find(j => j.id === a.jobId);
      if (!job) return a;
      const newScore = calculateScore(p.skills, job.skills);
      return { ...a, score: newScore, candidateSkills: [...p.skills], scoreUpdated: true };
    }));
  }, [jobs]);

  const createJob = useCallback((j: Omit<Job, 'id'>) => {
    setJobs(prev => [...prev, { ...j, id: `j_${Date.now()}` }]);
  }, []);

  const updateJob = useCallback((j: Job) => {
    setJobs(prev => prev.map(existing => existing.id === j.id ? j : existing));
    setTimeout(() => {
      setApplications(prev => prev.map(a => {
        if (a.jobId !== j.id || a.status === 'Withdrawn' || a.status === 'Rejected') return a;
        const newScore = calculateScore(a.candidateSkills, j.skills);
        return { ...a, score: newScore, scoreUpdated: true };
      }));
    }, 1500);
  }, []);

  const deleteJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  const toggleJobActive = useCallback((jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isActive: !j.isActive } : j));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const updateSettings = useCallback((s: Settings) => setSettingsState(s), []);
  const setHasCV = useCallback((v: boolean) => setHasCVState(v), []);

  const updatePrivateNotes = useCallback((appId: string, notes: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, privateNotes: notes } : a));
  }, []);

  const recalculateScores = useCallback(() => {
    setApplications(prev => prev.map(a => {
      if (a.candidateId !== CURRENT_CANDIDATE_ID || a.status === 'Withdrawn' || a.status === 'Rejected') return a;
      const job = jobs.find(j => j.id === a.jobId);
      if (!job) return a;
      const newScore = calculateScore(profile.skills, job.skills);
      return { ...a, score: newScore, scoreUpdated: true };
    }));
  }, [jobs, profile]);

  const updateCompanyInfo = useCallback((info: CompanyInfo) => {
    setCompanyInfo(info);
    setJobs(prev => prev.map(j => j.company === companyInfo.name ? { ...j, company: info.name } : j));
  }, [companyInfo.name]);

  const addScorecard = useCallback((s: Scorecard) => {
    setScorecards(prev => [...prev.filter(sc => sc.appId !== s.appId), s]);
    setActivityComments(prev => [...prev, {
      id: `ac_${Date.now()}`, appId: s.appId, type: 'system' as const,
      message: `Scorecard submitted: ★ ${s.rating}/5 — ${s.recommendation}`,
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const addActivityComment = useCallback((c: Omit<ActivityComment, 'id'>) => {
    setActivityComments(prev => [...prev, { ...c, id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }]);
  }, []);

  const getActivitiesForApp = useCallback((appId: string) => {
    return activityComments.filter(c => c.appId === appId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [activityComments]);

  const getScorecardForApp = useCallback((appId: string) => {
    return scorecards.find(s => s.appId === appId);
  }, [scorecards]);

  const blacklistCandidate = useCallback((appId: string) => {
    setApplications(prev => prev.map(a =>
      a.id === appId ? { ...a, isBlacklisted: !a.isBlacklisted } : a
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      role, page, jobs, applications, profile, notifications, settings, hasCV,
      selectedJobId, selectedCandidateAppId, kanbanSearch, companyInfo,
      scorecards, activityComments,
      login, logout, setPage, setSelectedJobId, setSelectedCandidateAppId,
      setKanbanSearch, applyToJob, guestApply, withdrawApplication, reapplyApplication,
      moveCandidateStage, rejectCandidate, updateProfile, createJob, updateJob,
      toggleJobActive, markNotificationRead, markAllNotificationsRead,
      updateSettings, setHasCV, updatePrivateNotes, recalculateScores, addNotification,
      updateCompanyInfo, addScorecard, addActivityComment, getActivitiesForApp, getScorecardForApp,
      blacklistCandidate, deleteJob,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
