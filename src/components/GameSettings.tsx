import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface GameSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    wordLength: number;
    maxGuesses: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  onSettingsChange: (settings: {
    wordLength: number;
    maxGuesses: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => void;
}

export const GameSettings = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: GameSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      wordLength: 5,
      maxGuesses: 6,
      difficulty: 'medium' as const,
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="word-length">Word Length</Label>
            <Select
              value={localSettings.wordLength.toString()}
              onValueChange={(value) =>
                setLocalSettings(prev => ({ ...prev, wordLength: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8].map((length) => (
                  <SelectItem key={length} value={length.toString()}>
                    {length} letters
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max-guesses">Number of Guesses</Label>
            <Select
              value={localSettings.maxGuesses.toString()}
              onValueChange={(value) =>
                setLocalSettings(prev => ({ ...prev, maxGuesses: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((guesses) => (
                  <SelectItem key={guesses} value={guesses.toString()}>
                    {guesses} guesses
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={localSettings.difficulty}
              onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                setLocalSettings(prev => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (Common words)</SelectItem>
                <SelectItem value="medium">Medium (Mixed difficulty)</SelectItem>
                <SelectItem value="hard">Hard (Challenging words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};