import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
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

  const statHighlights = [
    { label: 'Played', value: stats.played },
    { label: 'Win %', value: `${stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%` },
    { label: 'Streak', value: stats.currentStreak },
    { label: 'Tries', value: currentRow + 1 },
  ];

  return (
    <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-6 py-7 text-slate-900 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Daily Flow</p>
            <h1 className="mt-2 text-3xl font-semibold">Saleh's Wordle</h1>
            <p className="mt-2 max-w-md text-sm text-slate-600">
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
              className="rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Lightbulb className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={skipWord}
              disabled={gameState !== 'playing'}
              title="Skip"
              className="rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNewGame}
              title="New"
              className="rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/95"
      >
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
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_55px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/95">
        <GameKeyboard
          onKeyPress={handleKeyPress}
          usedLetters={usedLetters}
          disabled={gameState !== 'playing'}
        />
      </div>

      <Dialog open={resultOpen} onOpenChange={handleResultDialogChange}>
        <DialogContent className="liquid-panel sm:max-w-xl overflow-hidden rounded-[32px] p-0">
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-24 -top-28 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-200/55 via-emerald-200/25 to-transparent opacity-70" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/60 via-sky-200/25 to-transparent opacity-70 animate-liquid-orb" />
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-white/65" />
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

                <div className="liquid-panel-soft mx-auto w-full max-w-sm px-6 py-6 text-center text-slate-600">
                  <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Word</span>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    {completedWord.split('').map((letter, index) => (
                      <span
                        key={`${letter}-${index}`}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/55 bg-white/70 text-2xl font-semibold tracking-[0.2em] text-slate-900"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-8 grid gap-5">
                <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                  {statHighlights.map(({ label, value }) => (
                    <div key={label} className="liquid-panel-soft flex flex-col gap-1 px-4 py-4 text-slate-600">
                      <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">{label}</div>
                      <div className="text-2xl font-semibold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="liquid-panel-soft px-6 py-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
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
                          <div className="relative flex-1 h-2.5 overflow-hidden rounded-full bg-white/55">
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
              className="group w-full max-w-sm justify-center rounded-full bg-slate-900/95 px-6 py-5 text-base font-semibold text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.85)] transition-transform hover:scale-[1.01]"
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
  );
};
