import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import EmailTemplatesTab from './EmailTemplatesTab';
import { LATENCY } from '@/lib/uiHelpers';

const SettingsPage = () => {
  const { role, settings, updateSettings, logout, setPage, companyInfo, updateCompanyInfo } = useApp();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'company' | 'email_templates'>('general');
  const [saving, setSaving] = useState(false);

  // Company profile local state
  const [companyName, setCompanyName] = useState(companyInfo.name);
  const [companyWebsite, setCompanyWebsite] = useState(companyInfo.website);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(companyInfo.logoUrl);
  const [companyAbout, setCompanyAbout] = useState(companyInfo.about);

  const backPage = role === 'candidate' ? 'browse-jobs' : 'recruiter-dashboard';

  const handleSaveCompany = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, LATENCY.SAVE));
    updateCompanyInfo({ name: companyName, website: companyWebsite, logoUrl: companyLogoUrl, about: companyAbout });
    toast({ title: 'Company profile saved', description: 'Changes are now visible to candidates.' });
    setSaving(false);
  };

  const tabs = role === 'recruiter'
    ? [
        { id: 'general' as const, label: '⚙️ General' },
        { id: 'company' as const, label: '🏢 Company Profile' },
        { id: 'email_templates' as const, label: '✉️ Email Templates' },
      ]
    : [];

  return (
    <div className="max-w-[600px] mx-auto animate-fade-up">
      <button onClick={() => setPage(backPage)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Back
      </button>
      <h1 className="text-2xl font-bold tracking-heading mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account preferences</p>

      {/* Tabs for recruiter */}
      {tabs.length > 0 && (
        <div className="flex border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id ? 'border-indigo text-indigo' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Company Profile Tab */}
      {activeTab === 'company' && role === 'recruiter' && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Company Branding</h3>
            <p className="text-xs text-muted-foreground">This information is visible to candidates on job listings.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Company Name</label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Website URL</label>
                <Input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://techviet.com" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Logo URL</label>
                <Input value={companyLogoUrl} onChange={e => setCompanyLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="h-9 text-sm" />
                {companyLogoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={companyLogoUrl} alt="Logo preview" className="w-10 h-10 rounded-lg object-cover border border-border" onError={e => (e.currentTarget.style.display = 'none')} />
                    <span className="text-[10px] text-muted-foreground">Preview</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">About Us</label>
                <Textarea value={companyAbout} onChange={e => setCompanyAbout(e.target.value)} rows={4} placeholder="Tell candidates about your company culture, mission, and values..." className="text-sm" />
                <p className="text-[10px] text-muted-foreground mt-1">Supports markdown formatting</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <Button variant="indigo" className="w-full" onClick={handleSaveCompany} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'email_templates' && role === 'recruiter' && (
        <EmailTemplatesTab />
      )}

      {/* General Tab */}
      {(activeTab === 'general' || role === 'candidate') && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          <div className="p-5">
            <h3 className="text-sm font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive email updates on application status changes</p>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={v => updateSettings({ ...settings, emailNotifications: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground">Show notification badges and popover alerts</p>
                </div>
                <Switch checked={settings.inAppNotifications} onCheckedChange={v => updateSettings({ ...settings, inAppNotifications: v })} />
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-sm font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch checked={false} onCheckedChange={() => toast({ title: 'Coming soon', description: 'Dark Mode is in development ✦' })} />
              </div>
              {role === 'recruiter' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Hiring Manager View</p>
                    <p className="text-xs text-muted-foreground">Hide salary fields for non-HR interviewers</p>
                  </div>
                  <Switch checked={settings.privacyMode || false} onCheckedChange={v => updateSettings({ ...settings, privacyMode: v })} />
                </div>
              )}
            </div>
          </div>

          {role === 'recruiter' && (
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-4">Account</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company</span>
                  <Input
                    value={settings.companyName || ''}
                    onChange={e => updateSettings({ ...settings, companyName: e.target.value })}
                    className="w-48 h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Role</span>
                  <span className="text-sm text-muted-foreground">Recruiter</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-5">
            <div className="border border-red rounded-xl bg-red-light p-4">
              <h3 className="text-sm font-bold text-red">Delete Account</h3>
              <p className="text-xs text-muted-foreground mt-1">This will permanently delete your account and all data.</p>
              <Button variant="danger" size="sm" className="mt-3" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This cannot be undone. Type "DELETE" to confirm.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={() => {
                logout();
                toast({ title: 'Account deleted' });
              }}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
