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
        return 'bg-correct text-correct-foreground hover:bg-correct/95';
      case 'present':
        return 'bg-present text-present-foreground hover:bg-present/95';
      case 'absent':
        return 'bg-absent text-absent-foreground hover:bg-absent/95';
      default:
        return 'bg-secondary text-foreground hover:bg-secondary';
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
                'font-medium transition-colors duration-150',
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