import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (data: { rating: number; pros: string; cons: string; recommendation: 'Strongly Hire' | 'Hire' | 'No Hire' }) => void;
}

const ScorecardModal: React.FC<Props> = ({ open, onClose, candidateName, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [recommendation, setRecommendation] = useState<'Strongly Hire' | 'Hire' | 'No Hire' | ''>('');

  const handleSubmit = () => {
    if (!rating || !recommendation) return;
    onSubmit({ rating, pros, cons, recommendation: recommendation as 'Strongly Hire' | 'Hire' | 'No Hire' });
    setRating(0); setPros(''); setCons(''); setRecommendation('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>📝 Interview Scorecard — {candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium block mb-2">Overall Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber text-amber'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm font-mono-num self-center">{rating}/5</span>}
            </div>
          </div>

          {/* Pros */}
          <div>
            <label className="text-sm font-medium block mb-1">What did you like?</label>
            <Textarea rows={3} placeholder="Strong technical skills, good communication..." value={pros} onChange={e => setPros(e.target.value)} />
          </div>

          {/* Cons */}
          <div>
            <label className="text-sm font-medium block mb-1">Concerns?</label>
            <Textarea rows={3} placeholder="Limited experience with X, timezone concerns..." value={cons} onChange={e => setCons(e.target.value)} />
          </div>

          {/* Recommendation */}
          <div>
            <label className="text-sm font-medium block mb-2">Recommendation</label>
            <RadioGroup value={recommendation} onValueChange={v => setRecommendation(v as any)} className="flex gap-4">
              {(['Strongly Hire', 'Hire', 'No Hire'] as const).map(opt => (
                <div key={opt} className="flex items-center gap-1.5">
                  <RadioGroupItem value={opt} id={`rec-${opt}`} />
                  <Label htmlFor={`rec-${opt}`} className={`text-xs font-medium cursor-pointer ${
                    opt === 'Strongly Hire' ? 'text-emerald-dark' : opt === 'Hire' ? 'text-foreground' : 'text-red-dark'
                  }`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="indigo" onClick={handleSubmit} disabled={!rating || !recommendation}>Submit Scorecard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScorecardModal;
