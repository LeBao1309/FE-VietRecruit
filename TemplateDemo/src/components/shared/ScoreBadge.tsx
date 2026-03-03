import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  updated?: boolean;
}

export function getScoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary', border: 'border-primary' };
  if (score >= 50) return { bg: 'bg-amber-light', text: 'text-amber-dark', bar: 'bg-amber', border: 'border-amber' };
  return { bg: 'bg-red-light', text: 'text-red-dark', bar: 'bg-red', border: 'border-red' };
}

export function getScoreLabel(score: number) {
  if (score >= 80) return 'Strong Match';
  if (score >= 50) return 'Partial Match';
  return 'Low Match';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md', showLabel = true, updated }) => {
  const colors = getScoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.bar}`} />
        {showLabel && <span>{getScoreLabel(score)}</span>}
        <span className="font-mono-num">{score}%</span>
      </span>
      {updated && (
        <span className="text-[9px] font-mono-num px-1.5 py-0.5 rounded bg-amber-light text-amber-dark">↻ Updated</span>
      )}
    </div>
  );
};

export function ScoreBar({ score, className = '' }: { score: number; className?: string }) {
  const colors = getScoreColor(score);
  return (
    <div className={`w-full bg-secondary rounded-full h-1.5 ${className}`}>
      <div className={`h-full rounded-full ${colors.bar} animate-score-bar`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default ScoreBadge;
