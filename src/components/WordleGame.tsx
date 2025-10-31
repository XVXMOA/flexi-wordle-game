import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw, Eye, Lightbulb, ArrowRight } from 'lucide-react';
import { GameTile } from './GameTile';
import { GameKeyboard } from './GameKeyboard';
// import { TopNotification } from './TopNotification';
import { useWordle } from '@/hooks/useWordle';
import { cn } from '@/lib/utils';

interface WordleGameProps {
  settings: {
    wordLength: number;
    maxGuesses: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export const WordleGame = ({ settings }: WordleGameProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [resultOpen, setResultOpen] = useState(false);
  const [completedWord, setCompletedWord] = useState('');

  // Update local settings when parent settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const {
    currentGuess,
    guesses,
    gameState,
    usedLetters,
    targetWord,
    currentRow,
    stats,
    makeGuess,
    resetGame,
    updateCurrentGuess,
    skipWord,
    getHint
  } = useWordle(localSettings);

  const handleNewGame = useCallback(() => {
    resetGame();
  }, [resetGame]);


  const handleKeyPress = useCallback((key: string) => {
    if (gameState === 'playing') {
      if (key === 'ENTER') {
        makeGuess();
      } else if (key === 'BACKSPACE') {
        updateCurrentGuess(prev => prev.slice(0, -1));
      } else if (key.length === 1 && key.match(/[A-Z]/)) {
        if (currentGuess.length < localSettings.wordLength) {
          updateCurrentGuess(prev => prev + key);
        }
      }
    } else if ((gameState === 'won' || gameState === 'lost') && key === ' ') {
      // Space key to go to next word
      handleNewGame();
    }
  }, [gameState, currentGuess.length, localSettings.wordLength, makeGuess, updateCurrentGuess, handleNewGame]);

  useEffect(() => {
    const handlePhysicalKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      handleKeyPress(key);
    };

    window.addEventListener('keydown', handlePhysicalKeyPress);
    return () => window.removeEventListener('keydown', handlePhysicalKeyPress);
  }, [handleKeyPress]);

  // Capture the completed word and surface the result dialog when a round ends
  useEffect(() => {
    if ((gameState === 'won' || gameState === 'lost') && targetWord) {
      setCompletedWord(targetWord);
      setResultOpen(true);
    } else {
      setResultOpen(false);
    }
  }, [gameState, targetWord]);

  const handleResultDialogChange = useCallback((open: boolean) => {
    setResultOpen(open);
    if (!open && (gameState === 'won' || gameState === 'lost')) {
      handleNewGame();
    }
  }, [gameState, handleNewGame]);

  const handleNextWord = useCallback(() => {
    handleResultDialogChange(false);
  }, [handleResultDialogChange]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Daily Play</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">Saleh's Wordle</h1>
              <p className="text-sm text-slate-500 max-w-md">
                Guess the hidden word with calm focus. Keep your streak alive and celebrate the little wins.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={getHint}
                disabled={gameState !== 'playing'}
                title="Hint"
                className="rounded-full border-slate-200/80 bg-white/70 hover:bg-slate-50"
              >
                <Lightbulb className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={skipWord}
                disabled={gameState !== 'playing'}
                title="Skip"
                className="rounded-full border-slate-200/80 bg-white/70 hover:bg-slate-50"
              >
                <Eye className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNewGame}
                title="New"
                className="rounded-full border-slate-200/80 bg-white/70 hover:bg-slate-50"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Game Grid */}
        <Card className="rounded-3xl border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur">
          <div
            className="grid gap-3 justify-center"
            style={{
              gridTemplateRows: `repeat(${localSettings.maxGuesses}, 1fr)`,
            }}
          >
            {Array.from({ length: localSettings.maxGuesses }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  'grid gap-3 justify-center',
                  rowIndex === currentRow && gameState === 'playing' && guesses[rowIndex]?.some(tile => !tile.letter) && 'shake'
                )}
                style={{
                  gridTemplateColumns: `repeat(${localSettings.wordLength}, 1fr)`,
                }}
              >
                {Array.from({ length: localSettings.wordLength }).map((_, colIndex) => {
                  const tile = guesses[rowIndex]?.[colIndex];
                  const isCurrentRow = rowIndex === currentRow;
                  const letter = isCurrentRow && !tile?.letter
                    ? currentGuess[colIndex] || ''
                    : tile?.letter || '';

                  return (
                    <GameTile
                      key={`${rowIndex}-${colIndex}`}
                      letter={letter}
                      status={tile?.status || 'empty'}
                      delay={colIndex * 200}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Keyboard */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur">
          <GameKeyboard
            onKeyPress={handleKeyPress}
            usedLetters={usedLetters}
            disabled={gameState !== 'playing'}
          />
        </div>

        <Dialog open={resultOpen} onOpenChange={handleResultDialogChange}>
          <DialogContent className="sm:max-w-md rounded-3xl border-slate-200/70 bg-white/90">
            <DialogHeader className="text-center space-y-3">
              <DialogTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                {gameState === 'won' ? 'Beautifully done!' : 'Take a breather'}
              </DialogTitle>
              <p className="text-sm text-slate-500">
                The word you played was
              </p>
              <div className="text-4xl font-bold tracking-[0.4em] text-slate-800 uppercase">
                {completedWord}
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-[0.25em]">Played</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.played}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-[0.25em]">Win %</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-[0.25em]">Streak</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.currentStreak}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-[0.25em]">Tries</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{currentRow + 1}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/60 bg-slate-50/70 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 text-center">
                  Guess distribution
                </div>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: localSettings.maxGuesses }, (_, i) => {
                    const guessNum = i + 1;
                    const count = stats.guessDistribution?.[guessNum] || 0;
                    const maxCount = Math.max(...Object.values(stats.guessDistribution || {}), 1);
                    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={guessNum} className="flex items-center gap-3">
                        <span className="w-5 text-xs font-medium text-slate-500">{guessNum}</span>
                        <div className="flex-1 h-3 rounded-full bg-white/70 border border-slate-200/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="w-6 text-xs font-medium text-slate-500 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleNextWord} className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Next word
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};