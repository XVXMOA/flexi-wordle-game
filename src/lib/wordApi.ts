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

type Difficulty = 'easy' | 'medium' | 'hard';
type WordLength = 3 | 4 | 5 | 6 | 7 | 8;
export type WordCategory = 'normal' | 'brainrot' | 'famous' | 'games';

const FALLBACK_WORD_BANK: Record<WordCategory, Record<Difficulty, string[]>> = {
  normal: {
    easy: [
      'SUN', 'CAT', 'DOG', 'FUN', 'HUG', 'MAP', 'SKY', 'BEE', 'HAT', 'JOY', 'CAR', 'POP',
      'KEY', 'CUP', 'PEN', 'BAG', 'FOG', 'JAM', 'OWL', 'RAY', 'BUS', 'ICE', 'GEM', 'SIP',
      'NAP', 'STAR', 'MOON', 'LAMP', 'SONG', 'WARM', 'SOFT', 'COZY', 'CALM', 'KIND', 'LOVE', 'HOME',
      'TREE', 'RAIN', 'LAKE', 'SNOW', 'SMILE', 'LAUGH', 'DREAM', 'LIGHT', 'PEACE', 'HAPPY', 'SWEET', 'MERRY',
      'BLOOM', 'CLOUD', 'GRACE', 'HONEY', 'SUGAR', 'UNITY', 'BREEZE', 'SIMPLE', 'GENTLE', 'BRIGHT', 'BUTTER', 'FRIEND',
      'FAMILY', 'CANDLE', 'SUNSET', 'WONDER', 'MARVEL', 'SPROUT', 'MEADOW', 'ORCHID', 'SERENE', 'GOLDEN', 'HARBOR', 'HUMBLE',
      'SPRING', 'KINDLY', 'DELIGHT', 'SUNRISE', 'SPARKLE', 'HARMONY', 'SNUGGLE', 'GIGGLES', 'WARMEST', 'RAINBOW', 'SUNSHINE', 'CALMEST',
      'KINDEST', 'CHEERED', 'SOOTHED', 'CUDDLES', 'MELODIC', 'JOYFUL', 'SWEETER', 'HONESTY', 'SHIMMER', 'SERENITY', 'DREAMERS', 'COZIEST',
      'BLOSSOM', 'GLOWING', 'TIDINGS', 'SOFTEST'
    ],
    medium: [
      'ACORN', 'ADOBE', 'AERIE', 'AGATE', 'AGLOW', 'ALBUM', 'ALLEY', 'ALMOND', 'ALPINE', 'ALTAR', 'AMBER', 'AMBLE',
      'AMITY', 'AMPLE', 'ANCHOR', 'ARDENT', 'AROMA', 'ARROWS', 'ARTFUL', 'ASCEND', 'ASHEN', 'ATLAS', 'AUBURN', 'AVENUE',
      'BASIL', 'BEACON', 'BERRY', 'BIRCH', 'BISTRO', 'BLAZER', 'BLESS', 'BLUFFS', 'BREEZY', 'BRIDLE', 'BRONZE', 'BUTANE',
      'CABINS', 'CANDLE', 'CANVAS', 'CANYON', 'CARBON', 'CARVED', 'CASTLE', 'CAVERN', 'CEDARS', 'CHALKY', 'CHARMS', 'CHERRY',
      'CHIMES', 'CHOIRS', 'CINDERS', 'CIVICS', 'CLARET', 'CLEVER', 'CLOVER', 'COBALT', 'COCOON', 'COLONY', 'COMET', 'CORALS',
      'COSMIC', 'COVERS', 'CRADLE', 'CRANES', 'CRATER', 'CRISPY', 'CURFEW', 'CYPRESS', 'DAIRY', 'DAISY', 'DEWDROP', 'DINNER',
      'DORSAL', 'DREAMY', 'DRIFTS', 'DUSKIER', 'ECHOES', 'EDGIER', 'ELDEST', 'ELIXIR', 'EMBER', 'ENDEAR', 'ENIGMA', 'ENLIST',
      'ESCAPE', 'ESTATE', 'ETHICS', 'FABLED', 'FACTOR', 'FENNEL'
    ],
    hard: [
      'ABYSS', 'ACUMEN', 'ADROIT', 'AERIAL', 'ALCHEMY', 'ALCOVE', 'ALLURE', 'AMBIENT', 'AMULET', 'ANOMALY', 'APERTURE', 'APLOMB',
      'ARCANE', 'ARDENT', 'AURORAL', 'AUSTERE', 'AVARICE', 'AZURE', 'BASTION', 'BEACONS', 'BEQUEATH', 'BERYL', 'BOUTIQUE', 'BRAVURA',
      'BREVITY', 'BRONZED', 'BYGONE', 'CALDERA', 'CANDOR', 'CAPRICE', 'CARAVEL', 'CATKINS', 'CAULDRON', 'CAVERNS', 'CHALICE', 'CHASSIS',
      'CITADEL', 'CLARION', 'CLOISTER', 'COFFER', 'COGENT', 'COHORT', 'CONTOUR', 'CORPUS', 'COSMOS', 'CRAGGED', 'CRANIAL', 'CRYPTIC',
      'CURATOR', 'CYCLONE', 'DECREED', 'DELPHIC', 'DEMURE', 'DERVISH', 'DIADEMS', 'DIOXIDE', 'DOWAGER', 'DRIZZLE', 'EBONIES', 'ECLIPSE',
      'EDIFICE', 'EFFLUX', 'ELUSIVE', 'EMERALD', 'ENIGMA', 'ENNUI', 'EQUATOR', 'EROSION', 'ESCAPADE', 'ESSENCE', 'ETHEREAL', 'EVINCE',
      'EXOTICA', 'FACADE', 'FATHOM', 'FERVOR', 'FISSION', 'FLORID', 'FRESNEL', 'FUSION', 'GAUCHE', 'GLACIER', 'GLIMMER', 'GOSSAMER',
      'GRANITE', 'GRAVITY', 'GROTTO', 'HALCYON', 'HARROW', 'HELICAL', 'HEMLOCK', 'HEXAGON', 'HIATUS', 'HYDRATE', 'IMBRUE', 'INCISE',
      'INDIGO', 'INFLECT', 'INSIGHT', 'INTREPID'
    ],
  },
  brainrot: {
    easy: [
      'AMPED', 'BAE', 'BAES', 'BFFR', 'BOP', 'BRUH', 'CAP', 'CHILL', 'CLAP', 'CRAY', 'DANK', 'DEETS',
      'DRIP', 'DUB', 'EBOY', 'EGIRL', 'EXTRA', 'FAM', 'FAVE', 'FLEEK', 'FLEX', 'FLOP', 'FOMO', 'FRFR',
      'GIGA', 'GOAT', 'GYAT', 'GYATT', 'HYPE', 'ICY', 'ILY', 'ILYSM', 'KIKI', 'KWEEN', 'LIT', 'LMAO',
      'LOWKEY', 'MID', 'MOOD', 'NAH', 'NPC', 'OOMF', 'OOMFS', 'PETTY', 'PLUG', 'RATIO', 'REAL', 'RIZZ',
      'SALTY', 'SHIP', 'SIMP', 'SIS', 'SKSKS', 'SLAY', 'SNACC', 'SNAP', 'STAN', 'SUS', 'TEA', 'TOTES',
      'VIBE', 'WOKE', 'YAP', 'YEET', 'YIKES', 'BET', 'BOZO', 'CHEEKY', 'DAWGS', 'FIRE', 'GLOWUP', 'HEHE',
      'LAYER', 'MESSY', 'MUNCH', 'PRESS', 'SHEESH', 'SIZZLE', 'SLAPS', 'SLAYED', 'SLUSH', 'SPILL', 'SQUAD', 'SWIPE',
      'TREND', 'VIBEY', 'ZESTY', 'ZOOMER', 'ZOOTED'
    ],
    medium: [
      'SUSSY', 'YEETS', 'ONGOD', 'VIBES', 'HYPED', 'BADDIE', 'BANGER', 'BINGED', 'BOUJEE', 'CHEUGY', 'CLOWNY', 'CLUTCH',
      'CRINGE', 'CURSED', 'DOOMER', 'DRIPPY', 'EMOJIS', 'FANCAM', 'FILTER', 'FITCHECK', 'FOMOED', 'FROTHY', 'GASSER', 'GIGACHAD',
      'GOOBER', 'GRINDY', 'HATERS', 'HUSTLE', 'ITGIRL', 'JITTER', 'KAWAII', 'KEYSMASH', 'MAINCHAR', 'MEMEIFY', 'MEMERS', 'NEPOBABY',
      'NORMIE', 'NPCIFY', 'OVERIT', 'PHONKY', 'PICKME', 'POGGERS', 'RATCHET', 'RIZZED', 'SHOOKED', 'SKIBIDI', 'SLAYERS', 'SLEPTON',
      'SLIVING', 'SNAPPED', 'SPAMMED', 'STREAMS', 'SWAGGER', 'SWERVED', 'SWIFTIE', 'TIKTOK', 'TRIPPY', 'TWEAKER', 'UNCANNY', 'UPVOTE',
      'VLOGGER', 'VIBING', 'WERKING', 'WHATEVA', 'YAPPING', 'YEETING', 'ZOOMIES', 'ZOOTING', 'BODIED', 'DEGENS', 'GLOWIES', 'HYPEBAE',
      'JUICED', 'KILLJOY', 'KEYBOARD', 'LILBRO', 'MALDING', 'METAGIR', 'MICDROP', 'MOGGING', 'NAURRR', 'NETIZEN', 'PFRIEND', 'PLUSHIE',
      'POVSHOT', 'QUAKING', 'RATIOED', 'RIZZUP', 'SCENERS', 'SKRUNK', 'SLAYFUL', 'SPLICED', 'STREAMY', 'SWIPEUP', 'SYNERGY', 'TAPBACK',
      'TWEENIE', 'TWITTER', 'TWIZZY', 'VIBESET'
    ],
    hard: [
      'AESTHETE', 'ALTCORE', 'AUTOTUNE', 'BOPPING', 'BRAINROT', 'CANCELS', 'CLAPBACK', 'CLOUTED', 'CORECORE', 'CRINGING', 'CRONCHY', 'CYBERLOL',
      'DEEPFAKE', 'DELULUS', 'DISCORDS', 'DOOMCORE', 'DOWNVOTE', 'DRIPDROP', 'FANBASES', 'FANFICS', 'FILTERS', 'FLEXTAPE', 'GASLIGHT', 'GHOSTING',
      'GLITCHED', 'GLOWDOWN', 'GYATTING', 'HATEWAVE', 'HASHTAG', 'HYPERPOP', 'INSTABAE', 'ITGIRLS', 'KEYBOARD', 'LORECORE', 'MALDING', 'MASKFISH',
      'MEMELORD', 'NETDRAMA', 'NETFLIX', 'NORMCORE', 'OVERSTIM', 'PHONETIC', 'PLUGTALK', 'PODCASTS', 'REPOSTED', 'RETWEETS', 'SADBOYS', 'SASSCORE',
      'SCROLLER', 'SHIPFIC', 'SHIPNAME', 'SHIPPERS', 'SHITPOST', 'SIMPING', 'SNAPCHAT', 'SPAMCORE', 'STREAMED', 'STREAMER', 'SUBSTACK', 'SWAGGERS',
      'TIKTOKED', 'TRENDING', 'TWEETED', 'TWITCHIN', 'UNDERCUT', 'UNBOXED', 'UPVOTING', 'VIBECORE', 'VIRALITY', 'VLOGGERS', 'WEEBCORE', 'YASSIFY',
      'ZOOMCALL', 'ZOOMERED', 'BRAINLIT', 'CLIPBAIT', 'DOOMSCRO', 'EDITWARS', 'EMOTICON', 'ESCAPISM', 'FANEDITS', 'FEEDLOOP', 'GLOOPIFY', 'GOBLINED',
      'HASHTAGS', 'HYPETOK', 'INFLUENC', 'LOREBOOK', 'MEMECORE', 'MENTIONS', 'MICCHECK', 'MIDSCROL', 'NETCROWN', 'NORMPILL', 'PARASOCI', 'PLUGWALK',
      'PODCRUSH', 'REELSIDE', 'SCROLLIN', 'SHIPTALK'
    ],
  },
  famous: {
    easy: [
      'ADELE', 'ADAM', 'ALAN', 'ALIA', 'AMY', 'ANDY', 'ANNA', 'ARI', 'AVA', 'BECK', 'BEY', 'BILL',
      'BRIE', 'BRIT', 'BRUNO', 'CHAD', 'CHER', 'CHLOE', 'CHRIS', 'CYNDI', 'DRAKE', 'DUA', 'EMMA', 'ENYA',
      'ELLA', 'ELON', 'ERIN', 'FLOYD', 'FRANK', 'GAGA', 'GINA', 'GRACE', 'GWEN', 'IDRIS', 'IGGY', 'JAY',
      'JLO', 'JOHN', 'JOJO', 'JUDE', 'KANYE', 'KATY', 'KIM', 'KYLIE', 'LANA', 'LARRY', 'LIZZO', 'LORDE',
      'LUKE', 'MALIA', 'MARK', 'MEL', 'MIKA', 'MILEY', 'NICK', 'NICKI', 'NOAH', 'OBAMA', 'OPRAH', 'ORA',
      'OWEN', 'PINK', 'POST', 'QUAVO', 'RITA', 'ROSS', 'SADE', 'SEAN', 'SHAWN', 'SIA', 'TATE', 'TYGA',
      'TYLA', 'USHER', 'VERA', 'VIN', 'WES', 'WILL', 'YARA', 'ZAYN', 'ELSA', 'LIAM', 'MEGAN', 'NINA',
      'RUPA', 'SNOOP', 'TYRA', 'WIZ', 'AKON', 'BEBE', 'BETH', 'BOW', 'BTS', 'CELIA', 'COCO', 'DAX',
      'ENZO', 'ETTA', 'FKA', 'FLO'
    ],
    medium: [
      'ALICIA', 'ARIANA', 'AVRIL', 'BALVIN', 'BIEBER', 'BILLY', 'BLAKE', 'BLOOM', 'BRANDO', 'BRYANT', 'CAMILA', 'CARDI',
      'CAREY', 'CARTER', 'CHANCE', 'COOPER', 'DAMIAN', 'DEXTER', 'DIESEL', 'DOLLY', 'DWAYNE', 'ELLIOT', 'EMINEM', 'ESTHER',
      'FALLON', 'FERGIE', 'FRASER', 'GARCIA', 'GARNER', 'GIBSON', 'GOMEZ', 'GORDON', 'GRAHAM', 'HALSEY', 'HARRIS', 'HAYDEN',
      'HEWITT', 'HILARY', 'HUDSON', 'HUNTER', 'JAGGER', 'JENNER', 'JEREMY', 'JESSIE', 'JORDAN', 'JUSTIN', 'KARLIE', 'KEANU',
      'KENDRA', 'KHALID', 'KIMORA', 'KYRIE', 'LEBRON', 'LENNON', 'LILNAS', 'LOPEZ', 'LUPITA', 'MAGGIE', 'MARIAH', 'MARTIN',
      'MEGHAN', 'MELINA', 'MIGUEL', 'MILLER', 'MONICA', 'MURPHY', 'NELSON', 'OLIVIA', 'OSCAR', 'PABLO', 'PERRY', 'PORTER',
      'PRATT', 'PRINCE', 'QUINN', 'REEVES', 'RENNER', 'RIDLEY', 'RIVERS', 'ROBERT', 'RODMAN', 'RONNIE', 'SELENA', 'SANDRA',
      'SANTOS', 'SAWYER', 'SHANIA', 'SIMONE', 'STYLES', 'SWIFT', 'SYLVIA', 'TAYLOR', 'TELLER', 'THORNE', 'TIMBER', 'TREVOR',
      'TYSON', 'URSULA', 'VERNON', 'VINNIE'
    ],
    hard: [
      'BADBUNNY', 'BECKHAM', 'BENEDICT', 'BEYONCE', 'BRITNEY', 'CAMERON', 'CHASTAIN', 'CLOONEY', 'DANIELLE', 'DJKHALED', 'EILISH', 'ESPOSITO',
      'FERRERA', 'FLORENCE', 'FREEMAN', 'GILLIAN', 'GOSLING', 'HANNIBAL', 'HATHAWAY', 'HENDRIX', 'HOLLAND', 'JACKMAN', 'JENNIFER', 'JESSICA',
      'JORDAN', 'KENDRICK', 'KIDMAN', 'KRAVITZ', 'LAURENCE', 'LILWAYNE', 'MADONNA', 'MAGUIRE', 'MALONE', 'MARGOT', 'MATTHEW', 'MCCARTHY',
      'MCGREGOR', 'MICHAELS', 'MICHELLE', 'MIRANDA', 'NATALIE', 'ORLANDO', 'PASCAL', 'PORTMAN', 'PRESLEY', 'QUEENLAT', 'RADCLIFF', 'RIHANNA',
      'ROLLING', 'RUSSELL', 'SANDLER', 'SCHUMER', 'SEINFELD', 'SERENAWI', 'SHEERAN', 'SNOOPDOG', 'SPENCER', 'STALLONE', 'STREEP', 'TARANTIN',
      'THOMPSON', 'TIMOTHEE', 'TRAVISSC', 'TURNER', 'VICTORIA', 'WILLIAMS', 'WINFREY', 'ZENDAYA', 'ZUCKER', 'ARMSTRON', 'CHAPPELL', 'DAMON',
      'FERGUSON', 'GLOVER', 'HARRISON', 'KRISTEN', 'MACRON', 'OPPENHE', 'SANDOVAL', 'SCHWARZE', 'SCORSESE', 'SHERIDAN', 'SODERBER', 'STATHAM',
      'STILLER', 'SUDEIKIS', 'TARON', 'THERON', 'WATSON', 'WINCHEST', 'YEEZUS'
    ],
  },
  games: {
    easy: [
      'ABZU', 'ALBA', 'AMONG', 'ANNO', 'ASTRO', 'BABA', 'BALDI', 'BANJO', 'BLOON', 'BRAWL', 'CHESS', 'CLASH',
      'CRAZY', 'DANCE', 'DICEY', 'DONUT', 'DOOM', 'DOTA', 'FABLE', 'FEZ', 'FIFA', 'FROST', 'FUSER', 'GRIS',
      'GUILD', 'HALO', 'HADES', 'ICO', 'JOUST', 'JUMP', 'KATAM', 'KIRBY', 'LIMBO', 'LUMO', 'LUXOR', 'MAFIA',
      'MARIO', 'MINES', 'NINJA', 'OKAMI', 'ORI', 'ORION', 'OUTER', 'OXENF', 'PICO', 'POKER', 'PONG', 'QUAKE',
      'RAFT', 'REACH', 'RISK', 'RUSH', 'SKATE', 'SLIME', 'SMASH', 'SONIC', 'SPYRO', 'STEAM', 'STRAY', 'SUSHI',
      'TERRA', 'TOKYO', 'TUNIC', 'UNO', 'VALOR', 'VIVA', 'WARIO', 'WORMS', 'YOSHI', 'ZELDA', 'ZUMA', 'FROGGER',
      'PACMAN', 'SIMS', 'TETRIS', 'TEMTEM', 'VECTREX', 'AMIGA', 'BLOONS', 'BOMBER', 'CIV', 'COCOON', 'COLONY', 'CORTEX',
      'CRAFT', 'CURSE', 'DIZZY', 'ELITE', 'FARON', 'FLOCK', 'FROSTY', 'GALAGA', 'GAUNTL', 'GLIDER', 'HYPER', 'INDIE',
      'JAMMER', 'KENA', 'KUBO', 'LODE'
    ],
    medium: [
      'ANIMAL', 'ARKHAM', 'ASTRAL', 'BATMAN', 'BORDER', 'CASTLE', 'CHRONO', 'CITIES', 'CONTROL', 'CRASH', 'CUPHEAD', 'DESTINY',
      'DIABLO', 'DRAGONS', 'ELDEN', 'FALLOUT', 'FARCRY', 'FORZA', 'GALAXY', 'GEARS', 'GODWAR', 'HOLLOW', 'HORIZON', 'INFAMY',
      'INSIDE', 'ISLAND', 'KINGDOM', 'KLONOA', 'LEGACY', 'LEGEND', 'MADDEN', 'METROID', 'MONSTER', 'NARUTO', 'ODYSSEY', 'ORIGINS',
      'OUTLAST', 'OVERCOO', 'PAYDAY', 'PERSONA', 'PILLARS', 'POKEMON', 'PORTAL', 'RATCHET', 'RESIDENT', 'ROBLOX', 'ROCKET', 'SEKIRO',
      'SHADOW', 'SHOVEL', 'SKYRIM', 'SPIDER', 'STARDEW', 'STARFOX', 'STREET', 'SUNSET', 'TACTICS', 'TOMBRAI', 'TROPICO', 'UNCHART',
      'VALHEIM', 'VANGUAR', 'WATCHDO', 'WITCHER', 'WOLFEN', 'YAKUZA', 'ZOMBIES', 'XENOBLA', 'ARCEUS', 'CITIZEN', 'DRIFTER', 'HALCYON',
      'STARCRA', 'ABDUCTR', 'ALBEDO', 'ALIENIS', 'ANNEXED', 'ARCADIA', 'ARMELLO', 'ASCENT', 'AURION', 'AZUREDR', 'BANDICO', 'BAYONET',
      'BEYONDT', 'BIOMUTE', 'BIONITE', 'BITTRIP', 'CALIBER', 'CHRONOS', 'CODEVEI', 'COLONYS', 'CRIMSON', 'CYBERIA', 'CYTUS', 'DAUNTLE',
      'DAYGONE', 'DEMONIC', 'DISCO', 'ECHOES'
    ],
    hard: [
      'ASSASSIN', 'BAYONETT', 'BIOSHOCK', 'BLOODBOR', 'BORDERLD', 'CALLDUTY', 'CIVILIZA', 'CYBERPUN', 'DARKSOUL', 'DEADCELL', 'DESTROYA', 'DIABLOIV',
      'DISHONOR', 'DOOMETRN', 'DRAGONAG', 'EARTHBOU', 'ELDERING', 'FANTASIA', 'FIREEMBL', 'FROMSOFT', 'GEARSWAR', 'GODFALL', 'HALFLIFE', 'HOLLOWKN',
      'HORIZERO', 'INJUSTIC', 'KATAMARI', 'KINGDOMS', 'LEFTDEAD', 'MASSERED', 'METALGEA', 'MONHUNTR', 'MONOLITH', 'MORTALKO', 'NIERREPL', 'OUTERWLD',
      'OUTRIDER', 'OVERCOOK', 'PHASMAPH', 'PREYMOON', 'QUANTBRK', 'RADIANTA', 'RESIDENT', 'RETURNAL', 'ROGUELIK', 'SCARLETV', 'SEKIROSD', 'SHADOWMR',
      'SHOGUNTW', 'SKYFORGE', 'SKYRIVER', 'SORNAUTS', 'STARFIEL', 'STAROCEV', 'STARWARS', 'STEAMWLD', 'STELLRIS', 'STRAYGOD', 'STREETSX', 'SUBNAUTI',
      'SUNLESSS', 'TACTICAL', 'TERRARIA', 'THIEFTWN', 'TOMBRAID', 'TORMENNT', 'TOWERFAL', 'TRANSIST', 'TROVEHUB', 'UNCHARTD', 'VALORANT', 'VANGUARD',
      'VERMINTD', 'WARCRAFT', 'WASTELND', 'WOLFAMNG', 'XCOMTWO', 'ZELDARNG'
    ],
  },
};

const HISTORY_STORAGE_KEY = 'wordle-recent-history';
const HISTORY_LIMIT = 100;

type HistoryStore = Record<string, string[]>;

const isBrowserStorageAvailable = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const loadHistory = (): HistoryStore => {
  if (!isBrowserStorageAvailable()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as HistoryStore;
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    return Object.entries(parsed).reduce<HistoryStore>((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.filter((word): word is string => typeof word === 'string');
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to read word history:', error);
    return {};
  }
};

const saveHistory = (history: HistoryStore) => {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to persist word history:', error);
  }
};

const historyKeyFor = (length: WordLength, difficulty: Difficulty, category: WordCategory) =>
  `${category}:${difficulty}:${length}`;

const normalizeWordList = (words: string[]): string[] =>
  Array.from(
    new Set(
      words
        .map(word => word.trim().toUpperCase())
        .filter((word): word is string => word.length > 0)
    )
  );

const getWordPool = (length: WordLength, difficulty: Difficulty, category: WordCategory): string[] => {
  const categoryBank = FALLBACK_WORD_BANK[category] ?? FALLBACK_WORD_BANK.normal;
  const difficultyBank = categoryBank[difficulty] ?? FALLBACK_WORD_BANK.normal[difficulty];
  const normalized = normalizeWordList(difficultyBank);
  const filtered = normalized.filter(word => word.length === length);

  if (filtered.length > 0) {
    return filtered;
  }

  // Fallback to normal easy words if no matches exist
  const fallbackPool = normalizeWordList(FALLBACK_WORD_BANK.normal.easy).filter(word => word.length === length);
  return fallbackPool.length > 0 ? fallbackPool : ['HOUSE'];
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
