import React, { useState, useRef } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Upload, FileText, CheckCircle, X } from 'lucide-react';
import { WorkExperience, Education, Profile } from '@/types';

type CVState = 'idle' | 'analyzing' | 'complete';

const MyProfile = () => {
  const { profile, updateProfile, hasCV, setHasCV, setPage } = useApp();
  const { toast } = useToast();
  const [form, setForm] = useState<Profile>({ ...profile });
  const [skillInput, setSkillInput] = useState('');
  const [cvState, setCvState] = useState<CVState>(hasCV ? 'complete' : 'idle');
  const [cvFileName, setCvFileName] = useState(hasCV ? `${profile.name.replace(/\s/g, '_')}_CV.pdf` : '');
  const [showAIReview, setShowAIReview] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const calcCompletion = (p: Profile) => {
    let total = 0;
    if (p.name) total += 15; if (p.email) total += 10; if (p.phone) total += 5;
    if (p.summary) total += 15; if (p.skills.length > 0) total += 20;
    if (p.experiences.length > 0) total += 20; if (p.education.length > 0) total += 15;
    return Math.min(100, total);
  };

  const handleSave = () => {
    const updated = { ...form, completionPercent: calcCompletion(form) };
    updateProfile(updated);
    setLastSaved(new Date().toLocaleTimeString());
    toast({ title: 'Profile saved', description: 'AI scores recalculated for all applications' });
  };

  const addSkill = (val: string) => {
    const s = val.trim();
    if (s && !form.skills.includes(s)) setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (s: string) => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const addExperience = () => setForm(p => ({ ...p, experiences: [...p.experiences, { id: `e_${Date.now()}`, company: '', title: '', startDate: '', endDate: '', description: '' }] }));
  const removeExperience = (id: string) => setForm(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));
  const updateExperience = (id: string, field: keyof WorkExperience, value: string) => setForm(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const addEducation = () => setForm(p => ({ ...p, education: [...p.education, { id: `ed_${Date.now()}`, school: '', degree: '', major: '', year: '' }] }));
  const removeEducation = (id: string) => setForm(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
  const updateEducation = (id: string, field: keyof Education, value: string) => setForm(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    setCvFileName(file.name);
    setCvState('analyzing');
    setAnalyzeStep(1);
    // Step through: "Scanning text..." -> "Identifying Skills..." -> "Calculating Match..."
    const stepInterval = setInterval(() => setAnalyzeStep(s => Math.min(s + 1, 3)), 1000);
    setTimeout(() => {
      clearInterval(stepInterval);
      setCvState('complete');
      setHasCV(true);
      const extracted = ['Docker', 'AWS', 'CI/CD'];
      setForm(p => ({ ...p, skills: [...new Set([...p.skills, ...extracted])] }));
    }, 3000);
  };

  const completion = calcCompletion(form);

  // Empty state for no CV
  if (!hasCV) {
    return (
      <div className="animate-fade-up">
        <button onClick={() => setPage('browse-jobs')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft size={14} /> Back to Jobs
        </button>
        <div className="text-xs text-muted-foreground mb-4">My Profile / Edit Profile</div>
        <div className="flex flex-col items-center justify-center py-20">
          <FileText size={64} className="text-muted-foreground mb-6" strokeWidth={1} />
          <h2 className="text-xl font-bold mb-2">Your profile is empty.</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Upload your CV to auto-fill skills, experience, and education. AI will do the heavy lifting.
          </p>
          <Button variant="emerald" size="lg" onClick={() => fileRef.current?.click()} className="gap-2">
            📂 Import from CV
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">✦ AI will auto-fill your skills and experience</p>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e.target.files?.[0] || null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <button onClick={() => setPage('browse-jobs')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
        <ArrowLeft size={14} /> Back to Jobs
      </button>
      <div className="text-xs text-muted-foreground mb-4">My Profile / Edit Profile</div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Form */}
        <div className="flex-1 lg:w-[55%] space-y-6">
          {/* Completion */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="font-mono-num text-sm font-bold text-emerald">{completion}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full"><div className="h-full bg-emerald rounded-full transition-all" style={{ width: `${completion}%` }} /></div>
            <p className="text-[11px] text-muted-foreground mt-1">Complete your profile to improve AI match scores</p>
          </div>

          {/* Personal Info */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Personal Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Email</label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">LinkedIn</label><Input value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Location</label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Professional Summary</h3>
            <Textarea rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value.slice(0, 500) }))} maxLength={500} />
            <p className="text-[11px] text-muted-foreground text-right font-mono-num">{form.summary.length}/500</p>
          </div>

          {/* Skills */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-light text-indigo text-xs font-medium">
                  {s} <button onClick={() => removeSkill(s)}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); } }} />
              <Button variant="outline" size="sm" onClick={() => addSkill(skillInput)}><Plus size={14} /></Button>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Work Experience</h3>
            {form.experiences.map(exp => (
              <div key={exp.id} className="border border-border rounded-lg p-3 space-y-2 relative">
                <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-red hover:text-red-dark"><Trash2 size={14} /></button>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                  <Input placeholder="Title" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} />
                  <Input placeholder="Start" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                  <Input placeholder="End" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                </div>
                <Textarea rows={2} placeholder="Description" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} />
              </div>
            ))}
            <button onClick={addExperience} className="w-full border-2 border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
              ＋ Add Experience
            </button>
          </div>

          {/* Education */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Education</h3>
            {form.education.map(edu => (
              <div key={edu.id} className="border border-border rounded-lg p-3 space-y-2 relative">
                <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red hover:text-red-dark"><Trash2 size={14} /></button>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="School" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} />
                  <Input placeholder="Degree" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                  <Input placeholder="Major" value={edu.major} onChange={e => updateEducation(edu.id, 'major', e.target.value)} />
                  <Input placeholder="Year" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="w-full border-2 border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
              ＋ Add Education
            </button>
          </div>

          {/* CV Upload */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">CV Upload</h3>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e.target.files?.[0] || null)} />

            {cvState === 'idle' && (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-muted-foreground transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
              >
                <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Drop your PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF · Max 5MB</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>📂 Browse Files</Button>
                <p className="text-[11px] text-muted-foreground mt-3">✦ AI will extract your skills automatically after upload</p>
              </div>
            )}

            {cvState === 'analyzing' && (
              <div className="border border-border rounded-xl p-5 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={20} className="text-indigo" />
                  <div>
                    <p className="text-sm font-medium">{cvFileName}</p>
                    <p className="text-xs text-muted-foreground">🤖 AI is analyzing your CV...</p>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-indigo rounded-full relative overflow-hidden" style={{ width: '100%' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono-num">
                  Step {analyzeStep} of 3: {analyzeStep === 1 ? 'Scanning text...' : analyzeStep === 2 ? 'Identifying Skills...' : 'Calculating Match...'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">This usually takes 5–10 seconds.</p>
                <Button variant="ghost" size="xs" className="mt-2" onClick={() => { setCvState('idle'); setCvFileName(''); }}>✕ Cancel</Button>
              </div>
            )}

            {cvState === 'complete' && (
              <div className="border border-emerald rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={20} className="text-emerald" />
                  <div>
                    <p className="text-sm font-medium">{cvFileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {hasCV && !showAIReview ? 'Preview not available after refresh · Re-upload to refresh preview' : 'AI extracted skills & experiences'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAIReview(!showAIReview)}>✏️ Review & Correct AI Results</Button>
                  <Button variant="ghost" size="xs" onClick={() => { setCvState('idle'); setCvFileName(''); }}>Re-upload</Button>
                </div>
                {showAIReview && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="bg-amber-light rounded-lg p-2 text-xs text-amber-dark">⚠️ AI is not perfect — review each item before saving</div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Extracted Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {form.skills.map(s => (
                          <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-light text-indigo text-[11px]">
                            {s} <button onClick={() => removeSkill(s)}><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="emerald" size="sm" className="w-full" onClick={() => { setShowAIReview(false); handleSave(); }}>
                      ✓ Save Verified Data
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Bar */}
          <div className="sticky bottom-0 bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono-num">
              {lastSaved ? `Last saved: ${lastSaved}` : 'Unsaved changes'}
            </span>
            <Button variant="emerald" onClick={handleSave}>Save Profile</Button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:w-[45%]">
          <div className="sticky top-[76px]">
            <div className="text-[11px] uppercase text-muted-foreground tracking-widest mb-2">Live Preview</div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h2 className="text-lg font-bold">{form.name || 'Your Name'}</h2>
                <p className="text-xs text-muted-foreground">{form.email} · {form.phone}</p>
                {form.location && <p className="text-xs text-muted-foreground">{form.location}</p>}
              </div>
              {form.summary && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Summary</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{form.summary}</p>
                </div>
              )}
              {form.skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-1">{form.skills.map(s => <span key={s} className="px-2 py-0.5 rounded bg-indigo-light text-indigo text-[10px]">{s}</span>)}</div>
                </div>
              )}
              {form.experiences.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Experience</h3>
                  {form.experiences.map(e => (
                    <div key={e.id} className="mb-2">
                      <p className="text-xs font-medium">{e.title || 'Position'} at {e.company || 'Company'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono-num">{e.startDate} – {e.endDate}</p>
                    </div>
                  ))}
                </div>
              )}
              {form.education.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Education</h3>
                  {form.education.map(e => (
                    <div key={e.id} className="mb-1">
                      <p className="text-xs font-medium">{e.degree} in {e.major}</p>
                      <p className="text-[10px] text-muted-foreground">{e.school} · {e.year}</p>
                    </div>
                  ))}
                </div>
              )}
              {(form.skills.length === 0 && form.experiences.length === 0) && (
                <p className="text-xs text-muted-foreground text-center italic">Add your experience →</p>
              )}
              <div className="mt-4 pt-3 border-t border-border text-center">
                <span className={`font-mono-num text-xs font-bold ${completion >= 80 ? 'text-emerald' : completion >= 50 ? 'text-amber' : 'text-red'}`}>
                  CV Score: {completion}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
