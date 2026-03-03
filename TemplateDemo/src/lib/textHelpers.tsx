import React from 'react';

const HOT_KEYWORDS = ['React', 'TypeScript', 'Java', 'Spring', 'Node.js', 'AWS', 'Python', 'Go', 'Kubernetes', 'Docker', 'GraphQL', 'PostgreSQL'];

export function highlightKeywords(text: string): React.ReactNode[] {
  const regex = new RegExp(`\\b(${HOT_KEYWORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (HOT_KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase())) {
      return <span key={i} className="bg-amber-light font-semibold text-amber-dark px-0.5 rounded">{part}</span>;
    }
    return part;
  });
}

export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' (GMT+7)';
}

export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
