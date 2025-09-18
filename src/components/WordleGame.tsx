import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [showAnswerBanner, setShowAnswerBanner] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

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

  // Show top-center banner with the word when round ends
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      setShowAnswerBanner(true);
      setResultOpen(true);
      const t = setTimeout(() => setShowAnswerBanner(false), 3000);
      return () => clearTimeout(t);
    } else {
      setShowAnswerBanner(false);
      setResultOpen(false);
    }
  }, [gameState]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Saleh's Wordle</h1>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={getHint} 
              disabled={gameState !== 'playing'} 
              title="Hint"
            >
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={skipWord} 
              disabled={gameState !== 'playing'} 
              title="Skip"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleNewGame} title="New">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>


        {/* Game Grid */}
        <Card className="p-4 mb-4">
          <div className="grid gap-2 justify-center" style={{
            gridTemplateRows: `repeat(${localSettings.maxGuesses}, 1fr)`,
          }}>
            {Array.from({ length: localSettings.maxGuesses }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "grid gap-2 justify-center",
                  rowIndex === currentRow && gameState === 'playing' && guesses[rowIndex]?.some(tile => !tile.letter) && "shake"
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
                      delay={colIndex * 250}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Game Status */}
        {/* Result Modal */}
        <Dialog open={resultOpen} onOpenChange={setResultOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold mb-4">
                {gameState === 'won' ? 'You won!' : 'Game over'}
              </DialogTitle>
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">The word is:</div>
                <div className="text-3xl font-bold tracking-wider uppercase text-center">{targetWord}</div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center text-lg font-semibold mb-3">Statistics</div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.played}</div>
                  <div className="text-xs text-muted-foreground">Played</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</div>
                  <div className="text-xs text-muted-foreground">Win %</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentRow + 1}</div>
                  <div className="text-xs text-muted-foreground">Tries</div>
                </div>
              </div>
              
              {/* Guess Distribution Chart */}
              <div className="mt-6">
                <div className="text-center text-sm font-semibold mb-3">GUESS DISTRIBUTION</div>
                <div className="space-y-2">
                  {Array.from({ length: localSettings.maxGuesses }, (_, i) => {
                    const guessNum = i + 1;
                    const count = stats.guessDistribution?.[guessNum] || 0;
                    const maxCount = Math.max(...Object.values(stats.guessDistribution || {}), 1);
                    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={guessNum} className="flex items-center gap-2">
                        <div className="w-4 text-xs text-muted-foreground">{guessNum}</div>
                        <div className="flex-1 bg-muted rounded-sm h-4 relative">
                          <div 
                            className="bg-correct h-full rounded-sm transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="w-6 text-xs text-muted-foreground text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleNewGame} className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Next Word
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Keyboard */}
        <GameKeyboard
          onKeyPress={handleKeyPress}
          usedLetters={usedLetters}
          disabled={gameState !== 'playing'}
        />

        {/* Settings Modal - Remove this section */}
      </div>
    </div>
  );
};