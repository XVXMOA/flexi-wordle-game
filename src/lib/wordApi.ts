// Word API utilities for fetching and validating words

interface WordApiResponse {
  word: string;
  phonetic?: string;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
    }>;
  }>;
}

// Cache for words to avoid repeated API calls
const wordCache = new Map<string, boolean>();
const wordLists = new Map<string, string[]>();

// Fallback word lists organized by difficulty and length
const FALLBACK_WORDS = {
  easy: {
    3: ['CAT', 'DOG', 'SUN', 'CAR', 'BAT', 'HAT', 'RUN', 'FUN', 'BIG', 'RED'],
    4: ['LOVE', 'PLAY', 'WORD', 'TIME', 'GOOD', 'BEST', 'HELP', 'FIND', 'BOOK', 'GAME'],
    5: ['BEACH', 'HAPPY', 'WORLD', 'ABOUT', 'GREAT', 'PLACE', 'THINK', 'HOUSE', 'MUSIC', 'LIGHT'],
    6: ['CASTLE', 'FRIEND', 'NATURE', 'PEOPLE', 'MOTHER', 'FAMILY', 'GARDEN', 'SIMPLE', 'BRIDGE', 'ENERGY'],
    7: ['RAINBOW', 'JOURNEY', 'FLOWERS', 'KITCHEN', 'MORNING', 'EVENING', 'CHICKEN', 'PICTURE', 'MACHINE', 'NOTHING'],
    8: ['MOUNTAIN', 'SUNSHINE', 'COMPUTER', 'SANDWICH', 'KEYBOARD', 'ELEPHANT', 'BUILDING', 'LANGUAGE', 'CHAMPION', 'TEACHING']
  },
  medium: {
    3: ['FOX', 'JOY', 'KEY', 'OWL', 'ZOO', 'FLY', 'SKY', 'TRY', 'WHY', 'BOX'],
    4: ['QUIZ', 'JADE', 'COZY', 'MYTH', 'FURY', 'PONY', 'LEVY', 'FLUX', 'NAVY', 'PREY'],
    5: ['AZURE', 'PROXY', 'QUIRK', 'ZESTY', 'FUDGE', 'GLYPH', 'JUMPY', 'KNELT', 'LYMPH', 'MIXED'],
    6: ['OXYGEN', 'WIZARD', 'PUZZLE', 'FROZEN', 'JUNGLE', 'KNIGHT', 'ZODIAC', 'RHYTHM', 'SPHINX', 'VERTEX'],
    7: ['JOURNEY', 'QUICKLY', 'EXAMPLE', 'MYSTERY', 'TEXTURE', 'PROBLEM', 'COMPLEX', 'GRAPHIC', 'SCIENCE', 'NETWORK'],
    8: ['ABSTRACT', 'FUNCTION', 'MULTIPLY', 'EXCHANGE', 'FACEBOOK', 'RESEARCH', 'QUESTION', 'CREATIVE', 'POWERFUL', 'BUSINESS']
  },
  hard: {
    3: ['PHI', 'PSI', 'GNU', 'WYE', 'VEX', 'ZEP', 'QUA', 'JAY', 'REX', 'ZAX'],
    4: ['ONYX', 'LYNX', 'JINX', 'CRUX', 'FLUX', 'HOAX', 'COAX', 'WAXY', 'FOXY', 'PIXY'],
    5: ['FJORD', 'WALTZ', 'NYMPH', 'GLYPH', 'LYMPH', 'CRYPT', 'PSYCH', 'MYRRH', 'HYMNS', 'GYPSY'],
    6: ['RHYTHM', 'SYZYGY', 'KRYPTON', 'OXYGEN', 'ENZYME', 'PUZZLE', 'FROZEN', 'QUIZ'],
    7: ['NYMPHET', 'GRAFFITI', 'PSYCHOLOGY', 'RHYTHM', 'MYSTERY', 'COMPLEX', 'CRYPTIC', 'GRAPHIC'],
    8: ['RHYTHMIC', 'SYMPHONY', 'ZEPHYRUS', 'MYSTIQUE', 'BYZANTIUM', 'CATACLYSM', 'EPIPHANY', 'POLYMERS']
  }
};

// Get a random word from fallback lists
export const getRandomWord = async (length: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> => {
  try {
    // For now, use fallback words as the primary source
    const words = FALLBACK_WORDS[difficulty][length as keyof typeof FALLBACK_WORDS[typeof difficulty]];
    if (words && words.length > 0) {
      return words[Math.floor(Math.random() * words.length)];
    }

    // Fallback to easy words if requested difficulty/length not available
    const easyWords = FALLBACK_WORDS.easy[length as keyof typeof FALLBACK_WORDS.easy];
    return easyWords[Math.floor(Math.random() * easyWords.length)];
  } catch (error) {
    console.error('Error getting random word:', error);
    return 'HOUSE'; // Ultimate fallback
  }
};

// Validate if a word exists in the dictionary
export const isValidWord = async (word: string): Promise<boolean> => {
  const upperWord = word.toUpperCase();
  
  // Check cache first
  if (wordCache.has(upperWord)) {
    return wordCache.get(upperWord)!;
  }

  try {
    // First check if it's in our fallback word lists
    const allFallbackWords = [
      ...Object.values(FALLBACK_WORDS.easy).flat(),
      ...Object.values(FALLBACK_WORDS.medium).flat(),
      ...Object.values(FALLBACK_WORDS.hard).flat()
    ];
    
    if (allFallbackWords.includes(upperWord)) {
      wordCache.set(upperWord, true);
      return true;
    }

    // Try to validate with dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    const isValid = response.ok;
    
    // Cache the result
    wordCache.set(upperWord, isValid);
    return isValid;
  } catch (error) {
    console.error('Error validating word:', error);
    
    // For basic validation, check if it's a reasonable English word pattern
    const isReasonable = /^[A-Z]+$/.test(upperWord) && 
                        upperWord.length >= 3 && 
                        upperWord.length <= 8 &&
                        !/(.)\1{3,}/.test(upperWord); // No more than 3 consecutive same letters
    
    wordCache.set(upperWord, isReasonable);
    return isReasonable;
  }
};

// Preload common words for better performance
export const preloadCommonWords = async () => {
  const commonWords = [
    ...FALLBACK_WORDS.easy[5],
    ...FALLBACK_WORDS.medium[5],
    'HOUSE', 'MOUSE', 'PLANT', 'TRAIN', 'PLANE', 'CHAIR', 'TABLE', 'PHONE'
  ];
  
  commonWords.forEach(word => {
    wordCache.set(word, true);
  });
};