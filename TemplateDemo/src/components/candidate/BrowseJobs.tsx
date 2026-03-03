import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScoreBadge from '@/components/shared/ScoreBadge';
import PaginationControls from '@/components/shared/PaginationControls';
import JobDetailDrawer from './JobDetailDrawer';
import { Search, MapPin, X, Rocket, FileText } from 'lucide-react';
import { CURRENT_CANDIDATE_ID } from '@/data/mockData';
import { GuestApplyModal, CandidateCVUploadModal } from '@/components/shared/Modals';

const ITEMS_PER_PAGE = 9;

const BrowseJobs = () => {
  const { jobs, applications, profile, role, hasCV } = useApp();
  const isLoggedIn = !!role;
  const canUseAI = isLoggedIn && hasCV;
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState(canUseAI ? 'ai_match' : 'newest');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [guestApplyJobId, setGuestApplyJobId] = useState<string | null>(null);
  const [cvUploadModalOpen, setCvUploadModalOpen] = useState(false);
  const [heroDismissed, setHeroDismissed] = useState(false);

  // Reset sort when AI capability changes
  useEffect(() => {
    if (!canUseAI && sort === 'ai_match') setSort('newest');
  }, [canUseAI]);

  const calculateScore = (jobSkills: string[]) => {
    if (jobSkills.length === 0) return 50;
    const matched = profile.skills.filter(s => jobSkills.some(js => js.toLowerCase() === s.toLowerCase())).length;
    return Math.min(100, Math.round((matched / jobSkills.length) * 100));
  };

  const filtered = useMemo(() => {
    let result = jobs.filter(j => {
      if (keyword && !j.title.toLowerCase().includes(keyword.toLowerCase()) && !j.company.toLowerCase().includes(keyword.toLowerCase()) && !j.skills.some(s => s.toLowerCase().includes(keyword.toLowerCase()))) return false;
      if (locationFilter && !j.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (typeFilter !== 'All' && j.type !== typeFilter) return false;
      return true;
    });
    if (sort === 'ai_match' && canUseAI) result.sort((a, b) => calculateScore(b.skills) - calculateScore(a.skills));
    else if (sort === 'newest') result.sort((a, b) => a.postedDays - b.postedDays);
    else if (sort === 'salary_desc') result.sort((a, b) => b.salaryMax - a.salaryMax);
    else if (sort === 'salary_asc') result.sort((a, b) => a.salaryMin - b.salaryMin);
    return result;
  }, [jobs, keyword, locationFilter, typeFilter, sort, profile.skills, canUseAI]);

  const types = ['All', 'Full-time', 'Remote', 'Part-time', 'Contract'];
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedJobs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  return (
    <div className="animate-fade-up">
      {/* Onboarding Hero Banner */}
      {isLoggedIn && !hasCV && !heroDismissed && (
        <div className="relative bg-gradient-to-r from-indigo to-indigo-dark rounded-2xl p-6 mb-6 text-primary-foreground overflow-hidden">
          <button onClick={() => setHeroDismissed(true)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div className="flex-1">
              <h2 className="text-lg font-bold tracking-heading">Welcome to TalentOS! Let's get you hired.</h2>
              <p className="text-sm opacity-90 mt-1">Upload your CV to unlock AI Match Scores and One-Click Apply.</p>
            </div>
            <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 shrink-0" onClick={() => setCvUploadModalOpen(true)}>
              📄 Upload CV Now
            </Button>
          </div>
        </div>
      )}

      {/* Search Hero */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search jobs, skills, companies..." value={keyword} onChange={e => { setKeyword(e.target.value); setCurrentPage(1); }} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} className="pl-9 rounded-xl" />
          </div>
          <div className="relative flex-1 sm:max-w-[200px]">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Location" value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="pl-9 rounded-xl" />
          </div>
          <Button variant="emerald" className="rounded-xl">Search</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {types.map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${typeFilter === t ? 'bg-emerald text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
            >{t}</button>
          ))}
          <div className="ml-auto">
            <select value={sort} onChange={e => setSort(e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
              {canUseAI && <option value="ai_match">Best Match (AI)</option>}
              <option value="newest">Newest</option>
              <option value="salary_desc">Salary High→Low</option>
              <option value="salary_asc">Salary Low→High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No jobs found matching '{keyword}'</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Try different keywords or remove filters</p>
          <Button variant="emeraldOutline" onClick={() => { setKeyword(''); setTypeFilter('All'); setLocationFilter(''); setCurrentPage(1); }}>Clear Search</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedJobs.map(job => {
            const score = calculateScore(job.skills);
            const applied = applications.find(a => a.candidateId === CURRENT_CANDIDATE_ID && a.jobId === job.id && a.status !== 'Withdrawn');
            return (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`relative bg-card rounded-xl border border-border p-5 text-left transition-all hover:shadow-card-hover hover:-translate-y-0.5 ${!job.isActive ? 'opacity-50' : ''}`}
              >
                {!job.isActive && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">Position Closed</span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-light text-indigo flex items-center justify-center text-sm font-bold shrink-0">
                    {job.company[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[15px] leading-tight">{job.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">{job.location}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">{job.type}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-mono-num">${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}/mo</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-light text-indigo text-[11px] font-medium">{s}</span>
                  ))}
                  {job.skills.length > 3 && <span className="text-[11px] text-muted-foreground self-center">+{job.skills.length - 3} more</span>}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-mono-num">{job.postedDays}d ago</span>
                  {canUseAI ? (
                    <ScoreBadge score={score} />
                  ) : isLoggedIn && !hasCV ? (
                    <button
                      onClick={e => { e.stopPropagation(); setCvUploadModalOpen(true); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-indigo text-indigo hover:bg-indigo-light transition-colors"
                    >
                      ✨ Upload to see Match
                    </button>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setGuestApplyJobId(job.id); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-indigo text-indigo hover:bg-indigo-light transition-colors"
                    >
                      ✨ Check Match Score
                    </button>
                  )}
                </div>
                {applied && (
                  <div className="mt-2 text-xs text-emerald font-medium">✓ Applied</div>
                )}
              </button>
            );
          })}
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </>
      )}

      {selectedJob && (
        <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJobId(null)} />
      )}
      {guestApplyJobId && (
        <GuestApplyModal
          open={!!guestApplyJobId}
          onClose={() => setGuestApplyJobId(null)}
          jobId={guestApplyJobId}
          jobTitle={jobs.find(j => j.id === guestApplyJobId)?.title || ''}
        />
      )}
      <CandidateCVUploadModal
        open={cvUploadModalOpen}
        onClose={() => setCvUploadModalOpen(false)}
      />
    </div>
  );
};

export default BrowseJobs;
