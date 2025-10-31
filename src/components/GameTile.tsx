import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GameTileProps {
  letter: string;
  status: 'empty' | 'correct' | 'present' | 'absent';
  delay?: number;
}

export const GameTile = ({ letter, status, delay = 0 }: GameTileProps) => {
  const [revealedStatus, setRevealedStatus] = useState<'empty' | 'correct' | 'present' | 'absent'>('empty');
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (status !== 'empty' && letter) {
      // Start with empty background, then reveal status after delay
      setRevealedStatus('empty');
      setShouldAnimate(false);
      const timer = setTimeout(() => {
        setRevealedStatus(status);
        setShouldAnimate(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // For typing or empty tiles, show current status immediately
      setRevealedStatus(status);
      setShouldAnimate(false);
    }
  }, [status, letter, delay]);

  const getStatusStyles = () => {
    switch (revealedStatus) {
      case 'correct':
        return 'bg-correct text-correct-foreground border-correct';
      case 'present':
        return 'bg-present text-present-foreground border-present';
      case 'absent':
        return 'bg-absent text-absent-foreground border-absent';
      default:
        return 'bg-white text-empty-foreground border-slate-200 dark:bg-slate-900 dark:border-slate-800';
    }
  };

  return (
    <div
      className={cn(
        'w-16 h-16 border rounded-2xl flex items-center justify-center text-2xl font-semibold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.35)] dark:shadow-[0_12px_32px_-28px_rgba(2,6,23,0.65)]',
        getStatusStyles(),
        shouldAnimate && revealedStatus !== 'empty' && 'tile-flip'
      )}
    >
      {letter}
    </div>
  );
};