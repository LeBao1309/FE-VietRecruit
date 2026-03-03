import React from 'react';
import { useApp } from '@/store/AppContext';
import BrowseJobs from './BrowseJobs';
import MyApplications from './MyApplications';
import MyProfile from './MyProfile';
import CandidateMessenger from './CandidateMessenger';
import NotificationPopover from '@/components/shared/NotificationPopover';
import SettingsPage from '@/components/shared/SettingsPage';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Briefcase, FileText, User, Settings, LogOut, Menu, MessageCircle } from 'lucide-react';

const CandidatePortal = () => {
  const { page, setPage, notifications, logout, profile } = useApp();
  const unread = notifications.filter(n => n.recipientRole === 'candidate' && !n.isRead).length;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'browse-jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'my-applications', label: 'Applications', icon: FileText, badge: unread },
    { id: 'candidate-messages', label: 'Messages', icon: MessageCircle },
    { id: 'my-profile', label: 'Profile', icon: User },
    { id: 'candidate-settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (id: string) => {
    if (id === 'browse-jobs') return page !== 'my-applications' && page !== 'my-profile' && page !== 'candidate-settings' && page !== 'candidate-messages';
    return page === id;
  };

  const renderPage = () => {
    switch (page) {
      case 'my-applications': return <MyApplications />;
      case 'my-profile': return <MyProfile />;
      case 'candidate-settings': return <SettingsPage />;
      case 'candidate-messages': return <CandidateMessenger />;
      default: return <BrowseJobs />;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">VR</span>
          </div>
          <div>
            <span className="text-sm font-semibold">VietRecruit</span>
            <p className="text-[10px] text-muted-foreground">Candidate Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative ${
                  active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-px'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{item.label}</span>
                {item.badge ? <span className="w-2 h-2 rounded-full bg-notification absolute top-1.5 right-2" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{profile.name}</p>
              <p className="text-[10px] text-muted-foreground">Candidate</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] bg-card p-0 border-r border-border">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">VR</span>
              </div>
              <span className="text-sm font-semibold">VietRecruit</span>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 glass border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="md:hidden text-sm font-semibold">VietRecruit</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPopover role="candidate" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-4 py-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default CandidatePortal;
