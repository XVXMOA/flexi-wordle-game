import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Record<string, 'correct' | 'present' | 'absent'>;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const GameKeyboard = ({ onKeyPress, usedLetters, disabled }: GameKeyboardProps) => {
  const getKeyStatus = (key: string) => {
    return usedLetters[key] || 'unused';
  };

  const getKeyStyles = (key: string) => {
    const status = getKeyStatus(key);
    switch (status) {
      case 'correct':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-none shadow-sm hover:from-emerald-400/90 hover:to-emerald-500/90';
      case 'present':
        return 'bg-gradient-to-r from-amber-300 to-amber-400 text-slate-900 border-none shadow-sm hover:from-amber-300/90 hover:to-amber-400/90';
      case 'absent':
        return 'bg-slate-200/80 text-slate-500 border border-slate-200 hover:bg-slate-200';
      default:
        return 'bg-white/80 text-slate-700 border border-slate-200/80 hover:bg-slate-100';
    }
  };

  return (
    <div className="space-y-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((key) => (
            <Button
              key={key}
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => onKeyPress(key)}
              className={cn(
                'font-medium transition-colors duration-150 rounded-xl shadow-[0_12px_35px_-25px_rgba(15,23,42,0.5)] backdrop-blur',
                key === 'ENTER' || key === 'BACKSPACE' ? 'px-4' : 'px-3 py-2 min-w-[2.5rem]',
                getKeyStyles(key)
              )}
            >
              {key === 'BACKSPACE' ? (
                <Delete className="w-4 h-4" />
              ) : key === 'ENTER' ? (
                'Enter'
              ) : (
                key
              )}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
};