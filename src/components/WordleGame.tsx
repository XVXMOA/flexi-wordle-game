import { useState, useEffect, useCallback, useRef } from 'react';
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

const LIQUID_EXIT_DURATION = 520;

export const WordleGame = ({ settings }: WordleGameProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [resultOpen, setResultOpen] = useState(false);
  const [completedWord, setCompletedWord] = useState('');
  const resetTimerRef = useRef<number>();

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

  const clearPendingReset = useCallback(() => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = undefined;
    }
  }, []);

  const scheduleResetAfterExit = useCallback(() => {
    clearPendingReset();
    resetTimerRef.current = window.setTimeout(() => {
      handleNewGame();
      resetTimerRef.current = undefined;
    }, LIQUID_EXIT_DURATION);
  }, [clearPendingReset, handleNewGame]);


  const handleResultDialogChange = useCallback((open: boolean) => {
    setResultOpen(open);

    if (open) {
      clearPendingReset();
      return;
    }

    if (!open && (gameState === 'won' || gameState === 'lost')) {
      scheduleResetAfterExit();
    }
  }, [clearPendingReset, gameState, scheduleResetAfterExit]);

  const handleNextWord = useCallback(() => {
    handleResultDialogChange(false);
  }, [handleResultDialogChange]);

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
      handleNextWord();
    }
  }, [gameState, currentGuess.length, localSettings.wordLength, makeGuess, updateCurrentGuess, handleNextWord]);

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
      setCompletedWord(targetWord.toUpperCase());
      setResultOpen(true);
    } else {
      setResultOpen(false);
    }
  }, [gameState, targetWord]);

  useEffect(() => () => clearPendingReset(), [clearPendingReset]);

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
                Guess the hidden word with calm focus. Keep your streak alive and celebrate the little wins.(Names Are In Hard Mode).
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
          <DialogContent className="sm:max-w-xl">
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute -left-20 -top-24 h-48 w-48 rounded-full bg-emerald-200/60 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-sky-200/70 blur-3xl animate-liquid-orb" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-1 rounded-full bg-white/60" />
              <div className="relative px-8 pb-10 pt-12">
                <DialogHeader className="items-center space-y-4 text-center">
                  <DialogTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                    {gameState === 'won' ? 'You nailed the vibe' : 'Let the next one flow'}
                  </DialogTitle>
                  <p className="max-w-sm text-sm text-slate-500">
                    {gameState === 'won'
                      ? 'Every letter clicked into place. Take a second to enjoy the ripple before you dive back in.'
                      : 'That one slipped away, but the next word is already warming up. Shake it off and slide again.'}
                  </p>

                  <div className="w-full max-w-sm rounded-[26px] border border-white/60 bg-gradient-to-br from-white/85 via-white/40 to-white/10 px-6 py-6 text-center shadow-[0_20px_65px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                    <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Word</span>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      {completedWord.split('').map((letter, index) => (
                        <span
                          key={`${letter}-${index}`}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-2xl font-semibold tracking-[0.2em] text-slate-900 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.6)]"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-8 grid gap-5">
                  <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur-lg">
                      <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Played</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.played}</div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur-lg">
                      <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Win %</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur-lg">
                      <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Streak</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.currentStreak}</div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur-lg">
                      <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Tries</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">{currentRow + 1}</div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/60 bg-white/55 p-6 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.6)] backdrop-blur-xl">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                      <span>Guess rhythm</span>
                      <span>Max {localSettings.maxGuesses}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: localSettings.maxGuesses }, (_, i) => {
                        const guessNum = i + 1;
                        const count = stats.guessDistribution?.[guessNum] || 0;
                        const maxCount = Math.max(...Object.values(stats.guessDistribution || {}), 1);
                        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={guessNum} className="flex items-center gap-3">
                            <span className="w-6 text-xs font-medium text-slate-500">{guessNum}</span>
                            <div className="relative flex-1 h-3 overflow-hidden rounded-full border border-white/60 bg-white/40">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-[width] duration-500"
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
              </div>
            </div>
            <DialogFooter className="mt-0 w-full items-center justify-center px-8 pb-8">
              <Button
                onClick={handleNextWord}
                className="group w-full max-w-sm justify-center rounded-full border border-white/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-base font-semibold text-white shadow-[0_20px_45px_-28px_rgba(15,23,42,0.9)] transition-transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-2">
                  Next word
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};