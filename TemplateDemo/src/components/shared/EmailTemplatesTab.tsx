import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  EmailTemplates,
  EmailTemplate,
  TEMPLATE_VARIABLES,
  loadEmailTemplates,
  saveEmailTemplates,
} from '@/lib/emailTemplates';

const TEMPLATE_TYPES = [
  { key: 'application_received' as const, label: '📩 Application Received', desc: 'Auto-sent when a candidate applies' },
  { key: 'interview_invitation' as const, label: '📅 Interview Invitation', desc: 'Sent when scheduling an interview' },
  { key: 'job_offer' as const, label: '🎉 Job Offer', desc: 'Sent when moving candidate to Offer' },
  { key: 'rejection' as const, label: '📭 Rejection', desc: 'Sent when declining a candidate' },
] as const;

const EmailTemplatesTab = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplates>(loadEmailTemplates);
  const [activeKey, setActiveKey] = useState<keyof EmailTemplates>('application_received');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const current = templates[activeKey];

  const updateField = useCallback((field: keyof EmailTemplate, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [field]: value },
    }));
  }, [activeKey]);

  const insertVariable = useCallback((variable: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = current.body.slice(0, start);
    const after = current.body.slice(end);
    const newBody = before + variable + after;
    updateField('body', newBody);
    // Restore cursor after variable
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + variable.length;
      ta.setSelectionRange(pos, pos);
    });
  }, [current.body, updateField]);

  const handleSave = () => {
    saveEmailTemplates(templates);
    toast({ title: 'Template saved', description: `${TEMPLATE_TYPES.find(t => t.key === activeKey)?.label} updated.` });
  };

  return (
    <div className="space-y-4">
      {/* Template type selector */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveKey(t.key)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              activeKey === t.key
                ? 'border-indigo bg-indigo-light text-indigo'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            {TEMPLATE_TYPES.find(t => t.key === activeKey)?.desc}
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Subject Line</label>
              <Input
                value={current.subject}
                onChange={e => updateField('subject', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Body</label>
              <Textarea
                ref={bodyRef}
                value={current.body}
                onChange={e => updateField('body', e.target.value)}
                rows={8}
                className="text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-2 block">
                Click to insert variable at cursor position:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_VARIABLES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2 py-1 rounded-md bg-indigo-light text-indigo text-[11px] font-mono font-medium hover:bg-indigo/20 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Button variant="indigo" className="w-full" onClick={handleSave}>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesTab;
