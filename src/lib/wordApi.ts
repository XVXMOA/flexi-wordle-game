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

type Difficulty = 'easy' | 'medium' | 'hard';
type WordLength = 3 | 4 | 5 | 6 | 7 | 8;

const FALLBACK_WORDS: Record<Difficulty, Record<WordLength, string[]>> = {
  easy: {
    3: [
      'SUN', 'CAT', 'DOG', 'FUN', 'MAP', 'SKY', 'BEE', 'HAT', 'JOY', 'CAR', 'POP', 'BOW',
      'KEY', 'RUG', 'CUP', 'PEN', 'NUT', 'BAG', 'FAN', 'HOP', 'JAM', 'FIG', 'OWL', 'RAY',
      'EEL', 'BUS', 'HUG', 'ICE', 'GIG', 'YUM'
    ],
    4: [
      'WARM', 'SOFT', 'GLOW', 'KIND', 'PLAY', 'SNUG', 'EASY', 'SAFE', 'FINE', 'COZY', 'CHAT',
      'TIME', 'SING', 'TREE', 'RAIN', 'WIND', 'LUSH', 'MINT', 'FOAM', 'HOPE', 'BELL', 'BOOM',
      'MILD', 'LATE', 'PEAR', 'LAKE', 'SAND', 'STAR', 'GOOD', 'NEST'
    ],
    5: [
      'APPLE', 'SMILE', 'LIGHT', 'HAPPY', 'BLOOM', 'PEACE', 'NIGHT', 'CLOUD', 'BREAD', 'MUSIC',
      'DREAM', 'BRAVE', 'GREEN', 'LAUGH', 'SWEET', 'RIVER', 'SHINE', 'STORY', 'PLANT', 'HOUSE',
      'CHAIR', 'GRACE', 'MERRY', 'SPARK', 'HELLO', 'SLEEP', 'LEMON', 'TASTE', 'FAITH',
      'FRIEND', 'MAGIC', 'QUIET', 'TABLE', 'BERRY', 'WATER', 'SMOOTH', 'ANGEL', 'COAST',
      'BLISS'
    ],
    6: [
      'BUTTER', 'CANDLE', 'GARDEN', 'WONDER', 'PEBBLE', 'SUMMER', 'BRIGHT', 'SNUGLY', 'MELLOW',
      'NATURE', 'TENDER', 'HUMBLE', 'BOUNCE', 'KINDLY', 'LITTLE', 'MINGLE', 'SPROUT', 'SWIRLY',
      'BREATH', 'CALMER', 'CUDDLY', 'GIGGLE', 'GLOWER', 'PURELY', 'REFINE', 'SUGARY', 'WARMTH',
      'WHISKS', 'SMILEY', 'SOFTEN'
    ],
    7: [
      'AMAZING', 'BALLOON', 'BLOSSOM', 'BRIGHTS', 'CALMEST', 'CHARMER', 'DELIGHT', 'EMBRACE',
      'FIRELIT', 'GENTLER', 'GLOWING', 'HARMONY', 'IMAGINE', 'JOURNEY', 'KINDRED', 'LANTERN',
      'MEADOWS', 'MELODIC', 'NATURAL', 'OVERJOY', 'PLAYFUL', 'RAINBOW', 'SUNBEAM', 'TIDINGS',
      'UPLIFTS', 'VILLAGE', 'WARMEST', 'WHISPER', 'YAWNING', 'ZESTFUL'
    ],
    8: [
      'ADORABLE', 'BLOSSOMY', 'CHEERFUL', 'DAYLIGHT', 'EMBRACED', 'FLOWERED', 'GENTLEST',
      'HARMONIC', 'INSPIRED', 'JOURNEYS', 'KINDNESS', 'LANTERNS', 'MELODIES', 'NURTURED',
      'OVERFLOW', 'PLAYTIME', 'QUIETUDE', 'SERENITY', 'SUNSHINE', 'TREASURE', 'WHISPERS',
      'WINDSONG', 'WONDERED', 'CUPCAKES', 'SNUGGLES', 'WAVELIKE'
    ],
  },
  medium: {
    3: [
      'AIM', 'ARC', 'BOP', 'CHI', 'DUB', 'EGO', 'FAD', 'GIF', 'HIP', 'INK', 'JOT', 'KID',
      'LOL', 'MID', 'NGL', 'OMG', 'RAP', 'SIS', 'VEX', 'WOK', 'YEP', 'ZEN', 'BRB', 'AFT',
      'ICY', 'MEM', 'YAS', 'FYP', 'SUS'
    ],
    4: [
      'RIZZ', 'HYPE', 'VIBE', 'GOAT', 'MOOD', 'FLEX', 'YEET', 'FOMO', 'SHIP', 'SNAP', 'VLOG',
      'SWAY', 'ZOOM', 'GYAT', 'BAES', 'CLIP', 'DRIP', 'FAVE', 'LOFI', 'LURK', 'PING', 'BEEP',
      'STAN', 'VAPE', 'WINK', 'DUET', 'ECHO', 'GLAM', 'NORM', 'TREK'
    ],
    5: [
      'SUSSY', 'YEETS', 'GYATT', 'ONGOD', 'VIBES', 'HYPED', 'SLAPS', 'BASED', 'CLOWN', 'SWIPE',
      'TREND', 'SNEAK', 'RAVER', 'GHOST', 'VIRAL', 'BOOST', 'EMOTE', 'LIKED', 'SPAMS', 'SHARE',
      'STANS', 'REACT', 'REELS', 'SHORT', 'SWOON', 'GRIND', 'SCENE', 'SQUAD', 'FROTH', 'BLING'
    ],
    6: [
      'SHEESH', 'LOWKEY', 'CRINGE', 'GOATED', 'RIZZED', 'SLAYED', 'HYPERS', 'VIBING', 'REPOST',
      'STREAM', 'FOLLOW', 'MUTUAL', 'SCROLL', 'SPAMMY', 'TIKTOK', 'UNMUTE', 'UPLOAD',
      'VLOGGER', 'SWOOSH', 'FILTER', 'SHARER', 'EMOJIS', 'BINGED', 'FANDOM', 'REELER',
      'GIGGLY', 'GLOWUP', 'RETUNE'
    ],
    7: [
      'SKIBIDI', 'SLAYING', 'EMOJIFY', 'BINGING', 'CLOWNED', 'FOMOING', 'HASHTAG', 'SHIPPED',
      'STANNED', 'STREAMS', 'UPVOTED', 'VLOGGED', 'YAPPING', 'TWEETED', 'UNBOXED', 'REACTED',
      'SNAPPED', 'GYATTED', 'BOPPING', 'CANCELS'
    ],
    8: [
      'TRENDING', 'VIRALITY', 'SCROLLER', 'DISCORDS', 'REACTION', 'SHIPNAME', 'STREAMER',
      'FANBASES', 'RETWEETS', 'MEMELORD', 'AUTOTUNE', 'CLAPBACK', 'DOWNVOTE', 'PODCASTS',
      'REPOSTED', 'UPVOTING', 'PINGBACK', 'SUBSTACK', 'BRAINROT', 'ZOOMCALL'
    ],
  },
  hard: {
    3: [
      'AXE', 'COX', 'DYE', 'GNU', 'HEX', 'JIB', 'KEX', 'LYE', 'NIX', 'PYX', 'QAT', 'RHO',
      'SYN', 'TUX', 'VUG', 'WYE', 'ZED', 'JOW', 'PHI', 'TSK', 'WIZ', 'ZIG', 'QUO', 'DRY'
    ],
    4: [
      'ONYX', 'QUIZ', 'JAZZ', 'CZAR', 'MYTH', 'QOPH', 'JINX', 'ZARF', 'WHIZ', 'HYMN', 'TZAR',
      'SMEW', 'PHIZ', 'QADI', 'BUZZ', 'JOWL', 'ORYX', 'MUON', 'LYNX', 'ZEST'
    ],
    5: [
      'FJORD', 'LYMPH', 'PSALM', 'PHLOX', 'CRAZE', 'QUARK', 'QUIPU', 'WALTZ', 'ZIPPY', 'GIZMO',
      'JUMPS', 'KRILL', 'MYRRH', 'SPAZZ', 'XENON', 'ZAPPY', 'NINJA', 'VYING', 'PYGMY', 'BLAZE'
    ],
    6: [
      'SPHINX', 'JINXED', 'MUZZLE', 'PYTHON', 'ZEALOT', 'CRYPTS', 'RHYMES', 'QUARTZ', 'ZYGOTE',
      'PHLEGM', 'VORTEX', 'SQUIRM', 'OXYGEN', 'MYXOID', 'SCYTHE', 'THWACK', 'UNFURL', 'WIZARD'
    ],
    7: [
      'PHOENIX', 'ZEPHYRS', 'BUZZCUT', 'JAZZMAN', 'OXIDIZE', 'QUARTZY', 'RHIZOME', 'PSYCHED',
      'SPHERIC', 'MYXOMAS', 'CRYPTIC', 'ZOMBIFY', 'SUBTEXT', 'VECTORS', 'WHIZZED'
    ],
    8: [
      'QUIZZIFY', 'ZEPHYRUS', 'JAZZIEST', 'MYTHICAL', 'SPHINXES', 'CRYPTICS', 'OXIDIZER',
      'QUANTIZE', 'RHIZOPOD', 'BUZZWORD', 'JAWBREAK', 'VORTEXES', 'PSYCHICS', 'SQUEEZED',
      'TWIZZLED'
    ],
  },
};
// Get a random word from fallback lists
export const getRandomWord = async (
  length: number,
  difficulty: Difficulty,
  category: WordCategory = 'normal'
): Promise<string> => {
  try {
    const targetLength = Math.min(Math.max(Math.round(length), 3), 8) as WordLength;
    const pool = getWordPool(targetLength, difficulty, category);

    if (pool.length === 0) {
      return 'HOUSE';
    }

    const history = loadHistory();
    const key = historyKeyFor(targetLength, difficulty, category);
    const usedWords = new Set(history[key] ?? []);
    let available = pool.filter(word => !usedWords.has(word));

    if (available.length === 0) {
      history[key] = [];
      available = [...pool];
    }

    const word = available[Math.floor(Math.random() * available.length)];
    const updated = [...(history[key] ?? []), word];
    const maxHistory = Math.min(pool.length, HISTORY_LIMIT);
    history[key] = updated.slice(-maxHistory);
    saveHistory(history);

    return word;
  } catch (error) {
    console.error('Error getting random word:', error);
    return 'HOUSE';
  }
};

// Validate if a word exists in the dictionary
export const isValidWord = async (word: string): Promise<boolean> => {
  const upperWord = word.toUpperCase();

  if (wordCache.has(upperWord)) {
    return wordCache.get(upperWord)!;
  }

  try {
    const allFallbackWords = new Set(
      Object.values(FALLBACK_WORD_BANK)
        .flatMap(category => Object.values(category))
        .flatMap(words => normalizeWordList(words))
    );

    if (allFallbackWords.has(upperWord)) {
      wordCache.set(upperWord, true);
      return true;
    }

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    const isValid = response.ok;

    wordCache.set(upperWord, isValid);
    return isValid;
  } catch (error) {
    console.error('Error validating word:', error);

    const isReasonable = /^[A-Z]+$/.test(upperWord) &&
      upperWord.length >= 3 &&
      upperWord.length <= 8 &&
      !/(.)\1{3,}/.test(upperWord);

    wordCache.set(upperWord, isReasonable);
    return isReasonable;
  }
};

// Preload common words for better performance
export const preloadCommonWords = async () => {
  const commonWords = Array.from(
    new Set(
      Object.values(FALLBACK_WORD_BANK)
        .flatMap(category => Object.values(category))
        .flatMap(words => normalizeWordList(words))
    )
  ).slice(0, 200);

  commonWords.forEach(word => {
    wordCache.set(word, true);
  });
};
