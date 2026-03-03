import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, Paperclip, Sparkles, X, Star, ArrowRight, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  scorecard?: { name: string; score: number; skills: string[] };
}

interface DirectMessage {
  id: string;
  from: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "I've analyzed the top 3 candidates for the Senior Frontend Engineer role. Here's the scorecard for the strongest match:",
    timestamp: new Date(Date.now() - 120000),
    scorecard: { name: 'Nguyễn Minh Tuấn', score: 92, skills: ['React', 'TypeScript', 'System Design'] },
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you compare their experience levels?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '3',
    role: 'ai',
    content: 'Tuấn has 6 years of frontend experience with 3 years in lead roles. Linh has 4 years but stronger open-source contributions. I recommend scheduling both for technical interviews this week.',
    timestamp: new Date(Date.now() - 30000),
  },
];

const MOCK_DMS: DirectMessage[] = [
  { id: '1', from: 'Trần Thị Linh', avatar: 'TL', preview: 'Updated the interview schedule for tomorrow', time: '2m', unread: true },
  { id: '2', from: 'Phạm Văn Đức', avatar: 'PĐ', preview: 'The candidate accepted our offer!', time: '15m', unread: true },
  { id: '3', from: 'Lê Hoàng Nam', avatar: 'LN', preview: 'Can we discuss the JD changes?', time: '1h', unread: false },
  { id: '4', from: 'Võ Thanh Hà', avatar: 'VH', preview: 'Reference check completed for Minh', time: '3h', unread: false },
];

interface CopilotChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const CopilotChatPanel: React.FC<CopilotChatPanelProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'messages'>('copilot');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab, isTyping]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm processing your request. Let me analyze the candidate pipeline and get back to you with actionable insights.",
        timestamp: new Date(),
      }]);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-cmd-backdrop md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
        onClick={onClose}
      />

      {/* Floating Panel */}
      <div
        className="fixed top-3 right-3 bottom-3 w-[calc(100vw-24px)] md:w-[400px] z-50 flex flex-col rounded-2xl overflow-hidden animate-slide-in-right"
        style={{
          background: 'hsl(240 10% 4% / 0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: '0 0 0 1px hsl(0 0% 100% / 0.08), 0 0 40px hsl(0 0% 0% / 0.5), 0 0 80px hsl(180 100% 27% / 0.04)',
        }}
      >
        {/* Header with segmented control */}
        <div className="p-4 border-b border-primary-foreground/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles size={12} className="text-primary" />
              </div>
              <span className="text-[13px] font-semibold text-primary-foreground/90">VietRecruit</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.06] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <X size={14} />
            </button>
          </div>

          {/* Segmented control */}
          <div className="flex bg-primary-foreground/[0.05] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeTab === 'copilot'
                  ? 'bg-primary-foreground/[0.1] text-primary-foreground shadow-sm'
                  : 'text-primary-foreground/30 hover:text-primary-foreground/50'
              }`}
            >
              <div className="relative">
                <Bot size={13} />
                {activeTab === 'copilot' && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                )}
              </div>
              AI Copilot
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeTab === 'messages'
                  ? 'bg-primary-foreground/[0.1] text-primary-foreground shadow-sm'
                  : 'text-primary-foreground/30 hover:text-primary-foreground/50'
              }`}
            >
              <MessageSquare size={13} />
              Messages
              {MOCK_DMS.filter(d => d.unread).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {MOCK_DMS.filter(d => d.unread).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content area */}
        {activeTab === 'copilot' ? (
          <>
            {/* AI Conversation thread */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 kanban-scroll">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Meta */}
                  <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai' ? (
                      <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                        <Bot size={10} className="text-primary" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-primary-foreground/[0.1] flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary-foreground/60">HR</span>
                      </div>
                    )}
                    <span className="text-[10px] text-primary-foreground/25 font-mono">{formatTime(msg.timestamp)}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`w-fit max-w-[85%] p-3 text-[13px] leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-primary-foreground/[0.05] border border-primary-foreground/[0.06] rounded-r-xl rounded-bl-xl text-primary-foreground/80'
                        : 'bg-primary/15 border border-primary/30 rounded-l-xl rounded-br-xl text-primary font-medium'
                    }`}
                  >
                    {msg.content}

                    {/* Scorecard embed */}
                    {msg.scorecard && (
                      <div className="mt-3 p-3 rounded-lg bg-primary-foreground/[0.04] border border-primary-foreground/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-primary">NT</span>
                            </div>
                            <span className="text-[12px] font-medium text-primary-foreground/80">{msg.scorecard.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-primary font-mono">{msg.scorecard.score}%</span>
                        </div>
                        <div className="mb-2">
                          <Progress value={msg.scorecard.score} className="h-1.5 bg-primary-foreground/[0.06] [&>div]:bg-primary" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.scorecard.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 rounded-md bg-primary-foreground/[0.06] text-[10px] text-primary-foreground/50 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col gap-1.5 items-start animate-fade-up">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                      <Bot size={10} className="text-primary" />
                    </div>
                    <span className="text-[10px] text-primary-foreground/25 font-mono">typing</span>
                  </div>
                  <div className="w-fit bg-primary-foreground/[0.05] border border-primary-foreground/[0.06] rounded-r-xl rounded-bl-xl px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-[typingBounce_1.4s_ease-in-out_infinite]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-[typingBounce_1.4s_ease-in-out_0.2s_infinite]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-[typingBounce_1.4s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto kanban-scroll">
              {['Rank candidates', 'Draft outreach', 'Summarize pipeline'].map(action => (
                <button
                  key={action}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-primary-foreground/[0.04] border border-primary-foreground/[0.06] text-[11px] text-primary-foreground/40 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.08] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-primary-foreground/[0.06]" style={{ background: 'hsl(240 10% 3.5%)' }}>
              <div className="flex items-end bg-primary-foreground/[0.05] border border-primary-foreground/[0.08] rounded-xl p-2 focus-within:ring-1 focus-within:ring-primary/40 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI about candidates, pipeline, or tasks…"
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-[13px] text-primary-foreground/90 placeholder:text-primary-foreground/20 min-h-[36px] max-h-[100px] px-2 py-1.5"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground/20 hover:text-primary-foreground/40 hover:bg-primary-foreground/[0.06] transition-all">
                    <Paperclip size={13} />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-7 h-7 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-primary-foreground/15 mt-2 text-center font-mono">AI may produce inaccurate results · ⏎ to send</p>
            </div>
          </>
        ) : (
          /* Messages tab */
          <div className="flex-1 overflow-y-auto kanban-scroll">
            <div className="p-3">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search messages…"
                  className="w-full h-8 rounded-lg bg-primary-foreground/[0.05] border border-primary-foreground/[0.06] pl-8 pr-3 text-xs text-primary-foreground/80 placeholder:text-primary-foreground/20 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                />
                <MessageSquare size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-foreground/20" />
              </div>
            </div>

            <div className="px-2">
              {MOCK_DMS.map(dm => (
                <button
                  key={dm.id}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-foreground/[0.04] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    dm.unread ? 'bg-primary/20 text-primary' : 'bg-primary-foreground/[0.08] text-primary-foreground/40'
                  }`}>
                    {dm.avatar}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-medium truncate ${dm.unread ? 'text-primary-foreground/90' : 'text-primary-foreground/50'}`}>
                        {dm.from}
                      </span>
                      <span className="text-[10px] text-primary-foreground/20 font-mono shrink-0 ml-2">{dm.time}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${dm.unread ? 'text-primary-foreground/50' : 'text-primary-foreground/25'}`}>
                      {dm.preview}
                    </p>
                  </div>
                  {dm.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CopilotChatPanel;
