import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreHorizontal, Check, CheckCheck, ArrowLeft, Image, Bot } from 'lucide-react';

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isAI?: boolean;
}

interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  content: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

const MOCK_CONTACTS: ChatContact[] = [
  { id: 'ai', name: 'VietRecruit AI', avatar: 'AI', role: 'AI Career Assistant', lastMessage: 'I found 3 jobs matching your profile!', time: '1m', unread: 1, online: true, isAI: true },
  { id: '1', name: 'Trần Thị Linh', avatar: 'TL', role: 'HR Manager · TechCorp', lastMessage: "We'd love to schedule your interview for next week", time: '5m', unread: 2, online: true },
  { id: '2', name: 'Phạm Văn Đức', avatar: 'PĐ', role: 'Recruiter · StartupVN', lastMessage: 'Your application has been reviewed', time: '2h', unread: 0, online: true },
  { id: '3', name: 'Lê Hoàng Nam', avatar: 'LN', role: 'Tech Lead · DataFlow', lastMessage: 'Can you share your portfolio link?', time: '1d', unread: 0, online: false },
  { id: '4', name: 'Võ Thanh Hà', avatar: 'VH', role: 'HR · CloudBase', lastMessage: 'Thank you for applying!', time: '2d', unread: 0, online: false },
  { id: '5', name: 'Nguyễn Minh Tuấn', avatar: 'MT', role: 'CTO · FintechPro', lastMessage: "Great technical skills! Let's discuss further", time: '3d', unread: 0, online: false },
];

const MOCK_THREADS: Record<string, ChatMessage[]> = {
  ai: [
    { id: '1', from: 'them', content: 'Chào bạn! 👋 Mình là VietRecruit AI. Mình có thể giúp bạn tìm việc, chuẩn bị phỏng vấn, hoặc review CV.', time: '10:00', status: 'read' },
    { id: '2', from: 'me', content: 'Tìm giúp mình các vị trí Frontend Engineer ở HCM', time: '10:01', status: 'read' },
    { id: '3', from: 'them', content: 'Mình tìm thấy 3 vị trí phù hợp với profile của bạn:\n\n🏢 TechCorp — Senior Frontend Engineer\n💰 $2,500-3,500 · 📍 HCM\n⭐ AI Match: 92%\n\n🏢 StartupVN — Lead Frontend Dev\n💰 $3,000-4,000 · 📍 HCM\n⭐ AI Match: 87%\n\n🏢 DataFlow — Frontend Architect\n💰 $3,500-5,000 · 📍 HCM\n⭐ AI Match: 78%\n\nBạn muốn apply vị trí nào?', time: '10:01', status: 'read' },
  ],
  '1': [
    { id: '1', from: 'them', content: 'Hi! Thank you for applying to the Senior Frontend Engineer position at TechCorp.', time: '9:00', status: 'read' },
    { id: '2', from: 'them', content: "We reviewed your profile and we're impressed with your experience.", time: '9:01', status: 'read' },
    { id: '3', from: 'me', content: "I'm very interested in this position.", time: '9:15', status: 'read' },
    { id: '4', from: 'them', content: 'Great! Are you available for a technical interview next Tuesday at 2pm?', time: '9:20', status: 'read' },
    { id: '5', from: 'me', content: 'Yes, Tuesday 2pm works perfectly for me!', time: '9:25', status: 'read' },
    { id: '6', from: 'them', content: "We'd love to schedule your interview for next week. I'll send you the Google Meet link shortly.", time: '9:30', status: 'delivered' },
  ],
  '2': [
    { id: '1', from: 'them', content: 'Your application for Lead Frontend Dev has been reviewed by our team.', time: '14:00', status: 'read' },
    { id: '2', from: 'me', content: 'Thanks for the update! What are the next steps?', time: '14:30', status: 'read' },
    { id: '3', from: 'them', content: "Your application has been reviewed. We'll proceed with a coding challenge. Check your email!", time: '15:00', status: 'read' },
  ],
};

const CandidateMessenger: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(MOCK_THREADS);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const contact = MOCK_CONTACTS.find(c => c.id === selectedContact);
  const thread = selectedContact ? (messages[selectedContact] || []) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread, isTyping]);

  useEffect(() => {
    if (selectedContact && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [selectedContact]);

  const handleSend = () => {
    if (!input.trim() || !selectedContact) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'me',
      content: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'sent',
    };
    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg],
    }));
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'them',
        content: contact?.isAI
          ? 'Mình đang xử lý yêu cầu của bạn. Đợi mình chút nhé! 🔍'
          : 'Thanks for your message! I\'ll get back to you shortly.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'delivered',
      };
      setMessages(prev => ({
        ...prev,
        [selectedContact]: [...(prev[selectedContact] || []), reply],
      }));
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredContacts = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]">
      {/* Contact list — left panel */}
      <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] border-r border-border shrink-0`}>
        {/* Search header */}
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold mb-3 px-1">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg bg-secondary border border-border pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto kanban-scroll">
          {filteredContacts.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedContact(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-secondary/60 ${
                selectedContact === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                  c.isAI
                    ? 'bg-primary/20 text-primary'
                    : c.unread > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  {c.isAI ? <Bot size={16} /> : c.avatar}
                </div>
                {c.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--emerald))] border-2 border-card" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-medium truncate ${c.unread > 0 ? 'text-foreground' : 'text-foreground/70'}`}>
                    {c.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2 font-mono">{c.time}</span>
                </div>
                <p className={`text-[11px] truncate mt-0.5 ${c.unread > 0 ? 'text-foreground/60 font-medium' : 'text-muted-foreground'}`}>
                  {c.lastMessage}
                </p>
              </div>

              {/* Unread badge */}
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat thread — right panel */}
      {selectedContact && contact ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  contact.isAI ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {contact.isAI ? <Bot size={14} /> : contact.avatar}
                </div>
                {contact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(var(--emerald))] border-2 border-card" />
                )}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold">{contact.name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  {contact.online ? (
                    <span className="text-[hsl(var(--emerald))]">Active now</span>
                  ) : contact.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Phone size={15} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Video size={15} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 kanban-scroll bg-background/50">
            {/* Date separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium">Today</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {thread.map((msg, i) => {
              const isMe = msg.from === 'me';
              const showAvatar = !isMe && (i === 0 || thread[i - 1]?.from === 'me');
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-7 shrink-0">
                      {showAvatar && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          contact.isAI ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {contact.isAI ? <Bot size={11} /> : contact.avatar}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] group`}>
                    <div
                      className={`px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                          : 'bg-card border border-border rounded-2xl rounded-bl-md text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="text-[9px] text-muted-foreground font-mono">{msg.time}</span>
                      {isMe && (
                        msg.status === 'read' ? <CheckCheck size={10} className="text-primary" /> :
                        msg.status === 'delivered' ? <CheckCheck size={10} className="text-muted-foreground" /> :
                        <Check size={10} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start animate-fade-up">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  contact.isAI ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {contact.isAI ? <Bot size={11} /> : contact.avatar}
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-[typingBounce_1.4s_ease-in-out_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-[typingBounce_1.4s_ease-in-out_0.2s_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-[typingBounce_1.4s_ease-in-out_0.4s_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-end gap-2">
              <div className="flex items-center gap-0.5 shrink-0">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Image size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Paperclip size={16} />
                </button>
              </div>
              <div className="flex-1 flex items-end bg-secondary/60 border border-border rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground min-h-[32px] max-h-[100px] py-1"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <button className="shrink-0 ml-1 p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Smile size={16} />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground flex items-center justify-center shrink-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="hidden md:flex flex-1 items-center justify-center bg-background/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Your Messages</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Chat with recruiters, HR managers, and VietRecruit AI to advance your career.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateMessenger;
