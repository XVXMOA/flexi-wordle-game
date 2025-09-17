import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, RotateCcw, Trophy, Target, Eye, Lightbulb } from 'lucide-react';
import { GameTile } from './GameTile';
import { GameKeyboard } from './GameKeyboard';
import { GameSettings } from './GameSettings';
import { useWordle } from '@/hooks/useWordle';
import { cn } from '@/lib/utils';

export const WordleGame = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    wordLength: 5,
    maxGuesses: 6,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

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
  } = useWordle(settings);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      makeGuess();
    } else if (key === 'BACKSPACE') {
      updateCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key.match(/[A-Z]/)) {
      if (currentGuess.length < settings.wordLength) {
        updateCurrentGuess(prev => prev + key);
      }
    }
  }, [gameState, currentGuess.length, settings.wordLength, makeGuess, updateCurrentGuess]);

  useEffect(() => {
    const handlePhysicalKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      handleKeyPress(key);
    };

    window.addEventListener('keydown', handlePhysicalKeyPress);
    return () => window.removeEventListener('keydown', handlePhysicalKeyPress);
  }, [handleKeyPress]);

  const handleNewGame = () => {
    resetGame();
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setShowSettings(false);
    resetGame();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Wordle+</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={getHint}
              disabled={gameState !== 'playing'}
              title="Get a hint"
            >
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={skipWord}
              disabled={gameState !== 'playing'}
              title="Skip this word"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNewGame}
              title="New game"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.played}</div>
            <div className="text-sm text-muted-foreground">Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </div>
        </div>

        {/* Game Grid */}
        <Card className="p-4 mb-6">
          <div className="grid gap-2 justify-center" style={{
            gridTemplateRows: `repeat(${settings.maxGuesses}, 1fr)`,
          }}>
            {Array.from({ length: settings.maxGuesses }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "grid gap-2 justify-center",
                  rowIndex === currentRow && gameState === 'playing' && guesses[rowIndex]?.some(tile => !tile.letter) && "shake"
                )}
                style={{
                  gridTemplateColumns: `repeat(${settings.wordLength}, 1fr)`,
                }}
              >
                {Array.from({ length: settings.wordLength }).map((_, colIndex) => {
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
        {gameState === 'won' && (
          <Card className="p-4 mb-6 bg-correct/10 border-correct">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-correct mx-auto mb-2" />
              <p className="text-lg font-semibold text-correct">Congratulations!</p>
              <p className="text-sm text-muted-foreground">
                You guessed it in {currentRow + 1} tries!
              </p>
            </div>
          </Card>
        )}

        {gameState === 'lost' && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">Game Over!</p>
              <p className="text-sm text-muted-foreground">
                The word was: <span className="font-bold text-foreground">{targetWord}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Keyboard */}
        <GameKeyboard
          onKeyPress={handleKeyPress}
          usedLetters={usedLetters}
          disabled={gameState !== 'playing'}
        />

        {/* Settings Modal */}
        <GameSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
};