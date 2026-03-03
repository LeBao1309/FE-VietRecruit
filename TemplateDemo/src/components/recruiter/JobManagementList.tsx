import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { CreateJobModal } from '@/components/shared/Modals';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PaginationControls from '@/components/shared/PaginationControls';
import { Plus, Pencil, Eye, ArrowRight, Search, Download, Link2, Copy, Share2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/textHelpers';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 8;

const JobManagementList = () => {
  const { jobs, applications, setPage, setSelectedJobId, settings, deleteJob } = useApp();
  const { toast } = useToast();
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? job.isActive : !job.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentPage(1); };
  const handleStatusChange = (value: string) => { setStatusFilter(value as any); setCurrentPage(1); };

  const getJobCandidateCount = (jobId: string) => {
    const jobApps = applications.filter(a => a.jobId === jobId);
    return { total: jobApps.length, new: jobApps.filter(a => a.status === 'Applied').length };
  };

  const handleManage = (jobId: string) => { setSelectedJobId(jobId); setPage('recruiter-kanban'); };

  const handleDelete = (job: Job) => {
    const candidateCount = applications.filter(a => a.jobId === job.id && a.status !== 'Withdrawn' && a.status !== 'Rejected').length;
    if (candidateCount > 0) {
      toast({ title: '⛔ Cannot delete', description: `This job has ${candidateCount} active candidate(s). Please "Close" the job instead.`, variant: 'destructive' });
      return;
    }
    setDeleteConfirmJob(job);
  };

  const confirmDelete = () => {
    if (!deleteConfirmJob) return;
    const title = deleteConfirmJob.title;
    deleteJob(deleteConfirmJob.id);
    setDeleteConfirmJob(null);
    toast({ title: '🗑️ Job deleted', description: `"${title}" has been removed.` });
  };

  const handleClone = (job: Job) => {
    setEditJob(null);
    // Open create modal pre-filled via a clone job
    setEditJob({ ...job, id: '', title: `${job.title} (Copy)` } as Job);
    setCreateJobOpen(true);
  };

  const handleShareTo = (platform: string, jobId: string) => {
    toast({ title: `Shared to ${platform} (Mock)`, description: `Job link posted to ${platform}` });
  };

  const formatSalary = (min: number, max: number) => {
    if (settings.privacyMode) return '******';
    return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  };

  const renderDescription = (desc: string) => {
    return desc.split('\n').slice(0, 4).map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('## ')) return <p key={i} className="text-xs font-semibold mt-2">{trimmed.replace('## ', '')}</p>;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <li key={i} className="text-xs text-muted-foreground ml-4">{trimmed.replace(/^[-*]\s/, '')}</li>;
      return <p key={i} className="text-xs text-muted-foreground">{trimmed}</p>;
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-heading">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your job postings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={exportingCsv} onClick={async () => {
            setExportingCsv(true);
            await new Promise(r => setTimeout(r, 1500));
            const headers = ['Title', 'Company', 'Location', 'Type', 'Status', 'Posted', 'Candidates'];
            const rows = filteredJobs.map(j => {
              const c = getJobCandidateCount(j.id);
              return [j.title, j.company, j.location, j.type, j.isActive ? 'Active' : 'Closed', `${j.postedDays}d ago`, `${c.total}`];
            });
            exportToCsv(`jobs_export_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
            toast({ title: '📥 Export successful' });
            setExportingCsv(false);
          }}>{exportingCsv ? '⏳ Preparing...' : <><Download size={14} /> Export CSV</>}</Button>
          <Button variant="indigo" onClick={() => { setEditJob(null); setCreateJobOpen(true); }}>
            <Plus size={16} /> Create Job
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={searchQuery} onChange={e => handleSearchChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No jobs found matching '{searchQuery}'</p>
        </div>
      ) : (<>
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Job Title</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Posted</th>
              <th className="text-left px-4 py-3 font-medium">Candidates</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map(job => {
              const counts = getJobCandidateCount(job.id);
              return (
                <tr key={job.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-light text-indigo flex items-center justify-center text-xs font-bold shrink-0">{job.company[0]}</div>
                      <div>
                        <Tooltip><TooltipTrigger asChild><p className="text-sm font-medium line-clamp-1 max-w-[220px]">{job.title}</p></TooltipTrigger><TooltipContent>{job.title}</TooltipContent></Tooltip>
                        <p className="text-[10px] text-muted-foreground">{job.company} · {job.location} · {job.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${job.isActive ? 'bg-emerald-light text-emerald-dark' : 'bg-secondary text-muted-foreground'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono-num text-xs">{job.postedDays}d ago</td>
                  <td className="px-4 py-3">
                    <span className="font-mono-num text-xs">
                      {counts.new > 0 && <span className="text-indigo font-semibold">{counts.new} new · </span>}
                      {counts.total} total
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="indigo" size="xs" onClick={() => handleManage(job.id)}>Manage <ArrowRight size={12} /></Button>
                      <Tooltip><TooltipTrigger asChild>
                        <button onClick={() => handleClone(job)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Clone">
                          <Copy size={12} />
                        </button>
                      </TooltipTrigger><TooltipContent>Clone Job</TooltipContent></Tooltip>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Share">
                            <Share2 size={12} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="end">
                          <p className="text-xs font-medium mb-2 px-1">Share to:</p>
                          <button onClick={() => handleShareTo('Facebook', job.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors">📘 Facebook</button>
                          <button onClick={() => handleShareTo('LinkedIn', job.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors">💼 LinkedIn</button>
                          <button onClick={() => { navigator.clipboard.writeText(`https://talentos.app/j/${job.id}`); toast({ title: '🔗 Link copied to clipboard' }); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors">🔗 Copy Link</button>
                        </PopoverContent>
                      </Popover>
                      <button onClick={() => { setEditJob(job); setCreateJobOpen(true); }} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Edit"><Pencil size={12} /></button>
                      <button onClick={() => setPreviewJob(job)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Preview"><Eye size={12} /></button>
                      <Tooltip><TooltipTrigger asChild>
                        <button onClick={() => handleDelete(job)} className="w-10 h-10 rounded-lg border border-destructive/30 flex items-center justify-center hover:bg-destructive/10 transition-colors text-destructive" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </TooltipTrigger><TooltipContent>Delete Job</TooltipContent></Tooltip>
                    </div>
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
        {paginatedJobs.map(job => {
          const counts = getJobCandidateCount(job.id);
          return (
            <div key={job.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-light text-indigo flex items-center justify-center text-xs font-bold">{job.company[0]}</div>
                  <div>
                    <p className="text-sm font-semibold">{job.title}</p>
                    <p className="text-[10px] text-muted-foreground">{job.company}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${job.isActive ? 'bg-emerald-light text-emerald-dark' : 'bg-secondary text-muted-foreground'}`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs text-muted-foreground">{counts.total} candidates</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleClone(job)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"><Copy size={12} /></button>
                  <Button variant="indigo" size="xs" onClick={() => handleManage(job.id)}>Manage <ArrowRight size={12} /></Button>
                </div>
              </div>
            </div>
          );
        })}
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      </>)}

      {/* Job Preview Drawer */}
      <Sheet open={!!previewJob} onOpenChange={() => setPreviewJob(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto">
          {previewJob && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>{previewJob.title}</SheetTitle>
                  <button onClick={() => { navigator.clipboard.writeText(`https://talentos.app/j/${previewJob.id}`); toast({ title: '🔗 Link copied to clipboard' }); }} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary" title="Copy link"><Link2 size={14} /></button>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-lg bg-secondary">{previewJob.company}</span>
                  <span className="px-2 py-1 rounded-lg bg-secondary">{previewJob.location}</span>
                  <span className="px-2 py-1 rounded-lg bg-secondary">{previewJob.type}</span>
                  <span className="px-2 py-1 rounded-lg bg-secondary font-mono-num">
                    {formatSalary(previewJob.salaryMin, previewJob.salaryMax)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
                  {renderDescription(previewJob.description)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewJob.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-light text-indigo text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreateJobModal open={createJobOpen} onClose={() => { setCreateJobOpen(false); setEditJob(null); }} editJob={editJob} />

      <AlertDialog open={!!deleteConfirmJob} onOpenChange={v => !v && setDeleteConfirmJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteConfirmJob?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The job posting will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};

export default JobManagementList;
