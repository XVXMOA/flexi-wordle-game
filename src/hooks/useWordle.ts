import { useState, useEffect, useCallback } from 'react';
import { getRandomWord, isValidWord, type WordCategory } from '@/lib/wordApi';
import { useToast } from '@/hooks/use-toast';

interface Tile {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}

interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution?: Record<number, number>;
}

interface GameSettings {
  wordLength: number;
  maxGuesses: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: WordCategory;
}

type GameState = 'playing' | 'won' | 'lost';

export const useWordle = (settings: GameSettings) => {
  const [targetWord, setTargetWord] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [guesses, setGuesses] = useState<Tile[][]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [usedLetters, setUsedLetters] = useState<Record<string, 'correct' | 'present' | 'absent'>>({});
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('wordle-stats');
    return saved ? JSON.parse(saved) : { played: 0, won: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {} };
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const updateCurrentGuess = useCallback((updater: string | ((prev: string) => string)) => {
    setCurrentGuess(typeof updater === 'function' ? updater : updater);
  }, []);

  // Initialize game with a random word
  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const word = await getRandomWord(settings.wordLength, settings.difficulty, settings.category);
      setTargetWord(word.toUpperCase());
      setCurrentGuess('');
      setCurrentRow(0);
      setGuesses([]);
      setGameState('playing');
      setUsedLetters({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load a new word. Please try again.",
        variant: "destructive",
      });
      // Fallback to a default word if API fails
      const fallbackWords = {
        3: ['CAT', 'DOG', 'SUN'],
        4: ['LOVE', 'PLAY', 'WORD'],
        5: ['BEACH', 'HAPPY', 'WORLD'],
        6: ['CASTLE', 'FRIEND', 'NATURE'],
        7: ['RAINBOW', 'JOURNEY', 'FLOWERS'],
        8: ['MOUNTAIN', 'SUNSHINE', 'COMPUTER']
      } as const;
      const fallbacks = fallbackWords[settings.wordLength as keyof typeof fallbackWords] || fallbackWords[5];
      setTargetWord(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setIsLoading(false);
    }
  }, [settings, toast]);

  // Reset game
  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Check guess and update game state
  const makeGuess = useCallback(async () => {
    if (currentGuess.length !== settings.wordLength) {
      toast({
        title: "Invalid guess",
        description: `Word must be ${settings.wordLength} letters long`,
        variant: "destructive",
      });
      return;
    }

    // Check if word is valid
    const isValid = await isValidWord(currentGuess);
    if (!isValid) {
      toast({
        title: "Invalid word",
        description: "Not a valid word in our dictionary",
        variant: "destructive",
      });
      return;
    }

    // Create tiles for this guess
    const newTiles: Tile[] = [];
    const targetLetters = targetWord.split('');
    const guessLetters = currentGuess.split('');
    const newUsedLetters = { ...usedLetters };

    // First pass: mark correct letters
    guessLetters.forEach((letter, index) => {
      if (letter === targetLetters[index]) {
        newTiles[index] = { letter, status: 'correct' };
        newUsedLetters[letter] = 'correct';
        targetLetters[index] = ''; // Remove from available letters
      }
    });

    // Second pass: mark present letters
    guessLetters.forEach((letter, index) => {
      if (newTiles[index]) return; // Already marked as correct

      const targetIndex = targetLetters.indexOf(letter);
      if (targetIndex !== -1) {
        newTiles[index] = { letter, status: 'present' };
        if (newUsedLetters[letter] !== 'correct') {
          newUsedLetters[letter] = 'present';
        }
        targetLetters[targetIndex] = ''; // Remove from available letters
      } else {
        newTiles[index] = { letter, status: 'absent' };
        if (!newUsedLetters[letter]) {
          newUsedLetters[letter] = 'absent';
        }
      }
    });

    setUsedLetters(newUsedLetters);
    setGuesses(prev => [...prev, newTiles]);
    setCurrentGuess('');

    // Check win condition
    if (currentGuess === targetWord) {
      setGameState('won');
      const guessCount = currentRow + 1;
      const newStats = {
        ...stats,
        played: stats.played + 1,
        won: stats.won + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        guessDistribution: {
          ...stats.guessDistribution,
          [guessCount]: (stats.guessDistribution?.[guessCount] || 0) + 1
        }
      };
      setStats(newStats);
      localStorage.setItem('wordle-stats', JSON.stringify(newStats));
      toast({
        title: "Congratulations!",
        description: `You guessed it in ${currentRow + 1} tries!`,
      });
    } else if (currentRow + 1 >= settings.maxGuesses) {
      setGameState('lost');
      const newStats = {
        ...stats,
        played: stats.played + 1,
        currentStreak: 0,
      };
      setStats(newStats);
      localStorage.setItem('wordle-stats', JSON.stringify(newStats));
      toast({
        title: "Game Over",
        description: `The word was ${targetWord}`,
        variant: "destructive",
      });
    } else {
      setCurrentRow(prev => prev + 1);
    }
  }, [currentGuess, targetWord, currentRow, settings, usedLetters, stats, toast]);

  // Skip current word (reveal answer)
  const skipWord = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setGameState('lost');
    const newStats = {
      ...stats,
      played: stats.played + 1,
      currentStreak: 0,
    };
    setStats(newStats);
    localStorage.setItem('wordle-stats', JSON.stringify(newStats));
    
    toast({
      title: "Word Skipped",
      description: `The word was ${targetWord}`,
    });
  }, [gameState, stats, targetWord, toast]);

  // Get a hint (reveal one correct letter)
  const getHint = useCallback(() => {
    if (gameState !== 'playing' || currentRow >= settings.maxGuesses) return;
    
    // Find a letter that hasn't been guessed correctly yet
    const targetLetters = targetWord.split('');
    const revealedPositions = new Set<number>();
    
    // Check what's already been revealed correctly
    guesses.forEach(guess => {
      guess.forEach((tile, index) => {
        if (tile.status === 'correct') {
          revealedPositions.add(index);
        }
      });
    });
    
    // Find an unrevealed position
    const unrevealedPositions = targetLetters
      .map((_, index) => index)
      .filter(index => !revealedPositions.has(index));
    
    if (unrevealedPositions.length === 0) {
      toast({
        title: "No hints available",
        description: "All letters have been revealed!",
      });
      return;
    }
    
    // Pick a random unrevealed position
    const hintPosition = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
    const hintLetter = targetLetters[hintPosition];
    
    toast({
      title: "Hint!",
      description: `Position ${hintPosition + 1}: "${hintLetter}"`,
    });
  }, [gameState, currentRow, settings.maxGuesses, targetWord, guesses, toast]);

  // Initialize game on mount or settings change
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    targetWord,
    currentGuess,
    currentRow,
    guesses,
    gameState,
    usedLetters,
    stats,
    isLoading,
    makeGuess,
    resetGame,
    updateCurrentGuess,
    skipWord,
    getHint,
  };
};