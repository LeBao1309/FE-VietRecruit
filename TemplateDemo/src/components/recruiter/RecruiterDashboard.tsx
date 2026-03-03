import React from 'react';
import { useApp } from '@/store/AppContext';
import { Briefcase, Users, Calendar, Timer, ArrowRight } from 'lucide-react';

const RecruiterDashboard = () => {
  const { jobs, applications, setPage } = useApp();

  const activeJobs = jobs.filter(j => j.isActive).length;
  const totalCandidates = applications.length;
  const interviewsScheduled = applications.filter(a => a.status === 'Interview').length;

  const stats = [
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'bg-primary/10 text-primary' },
    { label: 'Total Candidates', value: totalCandidates, icon: Users, color: 'bg-emerald-light text-emerald-dark' },
    { label: 'Interviews', value: interviewsScheduled, icon: Calendar, color: 'bg-amber-light text-amber-dark' },
    { label: 'Avg Time to Hire', value: '18', suffix: 'days', icon: Timer, color: 'bg-secondary text-muted-foreground' },
  ];

  const appliedCount = applications.filter(a => a.status !== 'Withdrawn').length;
  const screeningCount = applications.filter(a => ['Screening', 'Interview', 'Offer'].includes(a.status)).length;
  const interviewCount = applications.filter(a => ['Interview', 'Offer'].includes(a.status)).length;
  const offerCount = applications.filter(a => a.status === 'Offer').length;

  const funnelStages = [
    { label: 'New', count: appliedCount, pct: 100, color: 'bg-primary/20' },
    { label: 'Screening', count: screeningCount, pct: appliedCount ? Math.round((screeningCount / appliedCount) * 100) : 0, color: 'bg-primary/40' },
    { label: 'Interview', count: interviewCount, pct: appliedCount ? Math.round((interviewCount / appliedCount) * 100) : 0, color: 'bg-primary/60' },
    { label: 'Offer', count: offerCount, pct: appliedCount ? Math.round((offerCount / appliedCount) * 100) : 0, color: 'bg-primary' },
  ];

  const sourceData = [
    { label: 'LinkedIn', pct: 40, color: 'hsl(var(--primary))' },
    { label: 'Facebook', pct: 30, color: 'hsl(var(--emerald))' },
    { label: 'Website', pct: 20, color: 'hsl(var(--amber))' },
    { label: 'Referral', pct: 10, color: 'hsl(var(--red))' },
  ];

  const recentActivity = [
    { message: 'Nguyễn Văn Anh applied to Senior Frontend Developer', time: '2 hours ago', type: 'apply' },
    { message: 'Interview scheduled with Bùi Quang Khải', time: '5 hours ago', type: 'interview' },
    { message: "Job 'Backend Engineer (Go)' was closed", time: '1 day ago', type: 'closed' },
    { message: 'Hoàng Đức Hải moved to Offer stage', time: '2 days ago', type: 'offer' },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const renderPieChart = () => {
    let cumulativeAngle = 0;
    const radius = 50;
    const cx = 60;
    const cy = 60;
    return sourceData.map((s, i) => {
      const angle = (s.pct / 100) * 360;
      const startRad = (cumulativeAngle - 90) * (Math.PI / 180);
      const endRad = (cumulativeAngle + angle - 90) * (Math.PI / 180);
      const largeArc = angle > 180 ? 1 : 0;
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      cumulativeAngle += angle;
      return (
        <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={s.color} />
      );
    });
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">{greeting}, HR Manager</h1>
        <p className="text-xs text-muted-foreground font-mono-num mt-1">{dateStr}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={() => stat.label === 'Active Jobs' ? setPage('recruiter-jobs') : undefined}
            className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-card-hover transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={16} />
            </div>
            <p className="text-2xl font-semibold font-mono-num tracking-tight">
              {stat.value}{stat.suffix && <span className="text-sm text-muted-foreground ml-1">{stat.suffix}</span>}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            {stat.label === 'Active Jobs' && (
              <span className="text-[10px] text-primary flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ArrowRight size={10} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Recruitment Funnel</h2>
          <div className="space-y-3">
            {funnelStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{stage.label}</span>
                  <span className="text-xs font-mono-num text-muted-foreground">{stage.count} ({stage.pct}%)</span>
                </div>
                <div className="h-7 bg-secondary rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(stage.pct, 5)}%` }}
                  >
                    {stage.pct > 15 && <span className="text-[10px] font-mono-num text-primary-foreground font-medium">{stage.pct}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.type === 'apply' ? 'bg-primary' :
                  item.type === 'interview' ? 'bg-amber' :
                  item.type === 'offer' ? 'bg-emerald' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-xs leading-relaxed">{item.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-num mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold mb-4">Candidate Sources</h2>
        <div className="flex items-center gap-8">
          <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">{renderPieChart()}</svg>
          <div className="flex-1 space-y-2">
            {sourceData.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs flex-1">{s.label}</span>
                <span className="text-xs font-mono-num font-medium">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
