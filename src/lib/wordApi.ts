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
      'SUN', 'CAT', 'DOG', 'FUN', 'MAP', 'SKY', 'BEE', 'HAT', 'JOY', 'CAR', 'POP', 'KEY', 'RUG', 'CUP', 'PEN', 'NUT', 'BAG',
      'FOG', 'JAM', 'FIG', 'OWL', 'RAY', 'BUS', 'HUG', 'ICE', 'GEM', 'LAD', 'SIP', 'WARM', 'SOFT', 'GLOW', 'KIND', 'PLAY',
      'SNUG', 'EASY', 'SAFE', 'FINE', 'COZY', 'CHAT', 'TIME', 'TREE', 'RAIN', 'WIND', 'LUSH', 'MINT', 'FOAM', 'HOPE', 'BELL',
      'BOOM', 'MILD', 'LATE', 'PEAR', 'LAKE', 'SAND', 'STAR', 'NEST', 'CALM', 'POND', 'DAWN', 'DUSK', 'NOTE', 'HOME', 'WISH',
      'MEAL', 'SONG',
      'LANE', 'APPLE', 'SMILE', 'LIGHT', 'HAPPY', 'BLOOM', 'PEACE', 'NIGHT', 'CLOUD', 'BREAD', 'MUSIC', 'DREAM', 'BRAVE',
      'GREEN', 'LAUGH', 'SWEET', 'RIVER', 'SHINE', 'STORY', 'PLANT', 'HOUSE', 'BUTTER', 'CANDLE', 'GARDEN', 'SUMMER',
      'BRIGHT', 'MELLOW', 'SPROUT', 'WARMTH', 'SMILEY', 'AMAZING', 'RAINBOW', 'SUNSHINE', 'ADORABLE', 'CHEERFUL', 'SERENE',
      'CUDDLE', 'GIGGLE', 'JOLLY', 'BUBBLE', 'PETALS', 'MEADOW', 'BREEZY', 'SPRING', 'VELVET', 'SOOTHE', 'PASTEL'
    ],
    medium: [
      'APT', 'ARC', 'ASH', 'AWE', 'BOP', 'CRY', 'ELF', 'FOX', 'GUM', 'HUE', 'IVY', 'JOT', 'KEG', 'LUX', 'MOP', 'NIX', 'OAR',
      'PEW', 'RIM', 'SLY', 'TAX', 'URN', 'VOW', 'WAX', 'YUM', 'ZAP', 'ABLE', 'ALOE', 'AURA', 'BRIM', 'BRISK', 'BROOK', 'BRUSH',
      'BURST', 'CHARM', 'CHIME', 'CHORD', 'CIDER', 'CLASP', 'CLEVER', 'CLOAK', 'CLOVER', 'COPSE', 'CRANE', 'CRISP', 'CROON',
      'DELTA', 'DINGO', 'DRAKE', 'DRESS', 'DRIFT', 'DUSKY', 'EARTH', 'ELATE', 'EMBER', 'FABLE', 'FLAIR', 'FLEET', 'FROST',
      'GAUZE', 'GLADE', 'GLEAM', 'GLINT', 'GLOBE', 'GNASH', 'GROVE', 'HAZEL', 'HEARTH', 'HEFTY', 'HONOR', 'HONEY', 'HUMID',
      'IVORY', 'JAUNT', 'JOVIAL', 'KHAKI', 'KNACK', 'KNELT', 'KNOLL', 'LAPSE', 'LAYER', 'LEGEND', 'LILAC', 'LINGER', 'LOFTY',
      'LUCID', 'LUMEN', 'MAGMA', 'MANOR', 'MAPLE', 'MARSH', 'MERIT', 'MINGLE', 'MIRTH', 'MOSAIC', 'MOSSY', 'MUSE', 'NIMBLE',
      'NOBLE', 'NOVEL', 'OASIS', 'ORBIT', 'OTTER', 'PARCH', 'PASTA', 'PEARL', 'PIVOT', 'PLAID', 'PLUME', 'POISE', 'PROSE',
      'QUILL', 'QUIRK', 'RADAR', 'RALLY', 'RAVEN', 'RELIC', 'RIDGE', 'RIPEN', 'ROAST', 'ROBIN', 'RUSTY', 'SABLE', 'SCARF',
      'SCOUT', 'SCRUB', 'SHALE', 'SHINY', 'SHOAL', 'SLOOP', 'SMOKE', 'SNACK', 'SOOTY', 'SPRIG', 'STAVE', 'STEAM', 'STOIC',
      'STRAW', 'SWIRL', 'TANGY', 'TAPER', 'THYME', 'TIDAL', 'TINGE', 'TOWEL', 'TRILL', 'TROVE', 'TWEED', 'TWINE', 'UNWIND',
      'UPLAND', 'UPTICK', 'VAPOR', 'VELVET', 'VIGOR', 'VIOLET', 'VIVID', 'WAFER', 'WALTZ', 'WEAVE', 'WHEAT', 'WHIRL', 'WILLOW',
      'WINCE', 'WOVEN', 'WRYLY', 'YEARN', 'YIELD', 'ZESTY', 'ZONED', 'BANYAN', 'DAYLIT', 'HARBOR', 'KOMBU', 'ORCHID', 'SEASON',
      'TURING', 'UPLIFT', 'WISTER'
    ],
    hard: [
      'ABYSS', 'ACRID', 'ADOBE', 'AORTA', 'APEXES', 'ARIDLY', 'ASTUTE', 'ATRIUM', 'AUBURN', 'AURORA', 'AZURE', 'BARQUE',
      'BARYON', 'BILLOW', 'BRAVURA', 'BREVITY', 'BRONZE', 'BYWORD', 'CAMEOS', 'CANTOR', 'CARAFE', 'CATKIN', 'CAVERN', 'CAYMAN',
      'CHASSE', 'CIRRUS', 'CODIFY', 'COFFER', 'CORPUS', 'COYOTE', 'CRAGGY', 'CURIO', 'CYCLIC', 'DARING', 'DELUDE', 'DEMISE',
      'DEVISE', 'DIODE', 'DORSAL', 'DREARY', 'DREIDEL', 'DRUIDS', 'ELIXIR', 'ENIGMA', 'ENTROPY', 'EQUINOX', 'FACADE', 'FATHOM',
      'FJORDS', 'FLORID', 'FRACTAL', 'FUSION', 'GALLEY', 'GALLIC', 'GARNET', 'GAUCHE', 'GLACIER', 'GLYPHS', 'GNOMON', 'GULLY',
      'GYRATE', 'HARROW', 'HELIUM', 'HEPTAD', 'HEXANE', 'HIATUS', 'HONCHO', 'IMBUED', 'INCISE', 'INDIGO', 'INGOTS', 'IONIZE',
      'IRENIC', 'JASMINE', 'JOUST', 'JURIST', 'KERNEL', 'KIMONO', 'KRAKEN', 'LAGOON', 'LATTICE', 'LIMPID', 'LITMUS', 'LUMBAR',
      'LYCEUM', 'LYRICS', 'MAGNET', 'MAGNOLIA', 'MANTRA', 'MATRIX', 'MERLOT', 'METRIC', 'MINUET', 'MIRROR', 'MODISH', 'MOROSE',
      'MOTIVE', 'MURMUR', 'NECTAR', 'NEXUS', 'NIMBUS', 'OBLATE', 'OBSIDIAN', 'OCTAVE', 'OCULAR', 'ONYXES', 'ORACLE', 'ORCHID',
      'ORIGAMI', 'OSPREY', 'OXYGEN', 'PAPYRI', 'PARSER', 'PELTED', 'PHASER', 'PHENOM', 'PHLOEM', 'PHOTON', 'PLIANT', 'PLINTH',
      'PRAIRIE', 'PRIMED', 'QUAINT', 'QUARTZ', 'QUASAR', 'QUORUM', 'RADIAL', 'RAMIFY', 'RAPTOR', 'RARITY', 'REBUKE', 'RELICS',
      'RESECT', 'REVERIE', 'RHETOR', 'RHOMBI', 'ROBUST', 'RUBRIC', 'RUNNEL', 'SALINE', 'SATURN', 'SCARAB', 'SCORIA', 'SCYTHE',
      'SEQUEL', 'SERRATE', 'SHRINE', 'SIMILE', 'SINEWY', 'SIRENS', 'SOLACE', 'SONATA', 'SPARROW', 'SPECTRA', 'SPHINX', 'SPIRAL',
      'STASIS', 'STATOR', 'SUBTLE', 'SUMMIT', 'SYZYGY', 'TANGENT', 'TENSOR', 'TERMINI', 'THERMO', 'THRIVE', 'TILTED', 'TORPID',
      'TRILOGY', 'TROCHE', 'TYCOON', 'UMBRAE', 'UNISON', 'VACUUM', 'VELLUM', 'VERITY', 'VORTEX', 'WHORL', 'ZEALOT', 'ZENITH',
      'ZEOLITE', 'ARCADIA', 'BASILICA', 'CITADEL', 'CURATOR', 'ECLIPSE', 'FANTASY', 'GOSSAMER', 'HARVEST', 'ILLUMIN', 'JOURNEY',
      'LAGOONS', 'MANDALA', 'NEBULAE', 'OBELISK', 'PENUMBRA', 'QUASARS', 'RESONATE', 'SYLVANS', 'TRIADIC', 'VINEYARD'
    ],
  },
  brainrot: {
    easy: [
      'AMPED', 'BAE', 'BAES', 'BFFR', 'BOP', 'BRUH', 'CAP', 'CHILL', 'CLAP', 'CRAY', 'DANK', 'DEETS', 'DRIP', 'DUB', 'EBOY',
      'EGIRL', 'EXTRA', 'FAM', 'FAVE', 'FLEEK', 'FLEX', 'FLOP', 'FOMO', 'FRFR', 'GIGA', 'GOAT', 'GYAT', 'HYPE', 'ICY', 'ICYMI',
      'ILYSM', 'KIKI', 'KWEEN', 'LIT', 'LMAO', 'LOWKEY', 'MID', 'MOOD', 'NAH', 'NPC', 'OOMF', 'OP', 'PETTY', 'PLUG', 'RATIO',
      'REAL', 'RIZZ', 'SALTY', 'SHIP', 'SIMP', 'SIS', 'SKSKS', 'SLAY', 'SNACC', 'SNAP', 'STAN', 'SUS', 'TEA', 'TOTES', 'VIBE',
      'WOKE', 'YAP', 'YEET', 'YIKES', 'BET', 'BOZO', 'CHEEKY', 'DAWGS', 'FIRE', 'GLOWUP', 'GYATT', 'HEH', 'OOMFS', 'PIPED',
      'PRESS', 'REALER', 'SHEESH', 'SLAPS', 'SNOW', 'TOXIC'
    ],
    medium: [
      'SUSSY', 'YEETS', 'ONGOD', 'VIBES', 'HYPED', 'SLAPS', 'BADDIE', 'BANGER', 'BINGED', 'BOUJEE', 'CHEUGY', 'CLOWNY',
      'CLUTCH', 'CRINGY', 'CURSED', 'DOOMER', 'DRIPPY', 'EMOJIS', 'EMOTED', 'FANCAM', 'FILTER', 'FITCHECK', 'FOMOED', 'FROTHY',
      'GASSER', 'GIGACHAD', 'GOBLIN', 'GOOBER', 'GRINDY', 'HATERS', 'HUSTLE', 'ITGIRL', 'JANKY', 'JITTER', 'KAWAII',
      'KEYSMASH', 'MAINCHAR', 'MEMEIFY', 'MEMERS', 'NEPOBABY', 'NORMIE', 'NPCIFY', 'OVERIT', 'PHONKY', 'PICKME', 'POGGERS',
      'RATCHET', 'REELING', 'RIZZED', 'SHOOKED', 'SKIBIDI', 'SLAYERS', 'SLEPTON', 'SLIVING', 'SLOWED', 'SNAPPED', 'SPAMMED',
      'STREAMS', 'SWAGGER', 'SWERVED', 'SWIFTIE', 'TIKTOK', 'TRIPPY', 'TWEAKER', 'UNCANNY', 'UPVOTE', 'VLOGGER', 'VIBING',
      'WERKING', 'WHATEVA', 'YAPPING', 'YEETING', 'ZOOMIES', 'ZOOTED', 'BODIED', 'DEGENS', 'FYP', 'GLOWIES', 'HARDLAH',
      'HYPEBAE', 'JUICED', 'LOKEY', 'SLAPPP', 'SPILL', 'TAPPIN', 'VIBECHK'
    ],
    hard: [
      'AESTHETE', 'ALTCORE', 'AUTOTUNE', 'BOPPING', 'BRAINROT', 'CANCELS', 'CLAPBACK', 'CLOUTED', 'CORECORE', 'CRINGING',
      'CRONCHY', 'CYBERLOL', 'DEEPFAKE', 'DELULUS', 'DISCORDS', 'DOOMCORE', 'DOWNVOTE', 'DREAMCORE', 'DRIPDROP', 'DUPECORE',
      'FANBASES', 'FANFICS', 'FILTERS', 'FLEXTAPE', 'GASLIGHT', 'GHOSTING', 'GLITCHED', 'GLOWDOWN', 'GYATTING', 'HATEWATCH',
      'HASHTAG', 'HYPERPOP', 'INSTABAE', 'ITGIRLS', 'KEYBOARD', 'LORECORE', 'LOLCATZ', 'MALDING', 'MASKFISH', 'MEMELORD',
      'MICDROP', 'NETDRAMA', 'NETFLIX', 'NORMCORE', 'OVERSTIM', 'PINGBACK', 'PLUGTALK', 'PODCASTS', 'REACTION', 'REPOSTED',
      'RETWEETS', 'SADBOYS', 'SASSCORE', 'SCREAMIN', 'SCROLLER', 'SHIPFIC', 'SHIPNAME', 'SHIPPERS', 'SHITPOST', 'SIMPING',
      'SNAPCHAT', 'SPAMCORE', 'STREAMED', 'STREAMER', 'SUBSTACK', 'SWAGGERS', 'TIKTOKED', 'TRENDING', 'TWEETED', 'TWITCHIN',
      'UNDERCUT', 'UNBOXED', 'UPVOTING', 'VIBECORE', 'VIRALITY', 'VLOGGERS', 'WEEBCORE', 'YASSIFY', 'ZOOMCALL', 'ZOOMERED',
      'BRAINLIT', 'CLIQUEUP', 'DOOMSCRO', 'FYPCORE', 'HYPETOK', 'LOLCODES', 'SPARKLET', 'SWIFTTOK'
    ],
  },
  famous: {
    easy: [
      'ADELE', 'ADAM', 'ALAN', 'ALIA', 'AMY', 'ANDY', 'ANNA', 'ARI', 'AVA', 'BECK', 'BEY', 'BILL', 'BRIE', 'BRIT', 'BRUNO',
      'CHAD', 'CHER', 'CHLOE', 'CHRIS', 'CYNDI', 'DRAKE', 'DUA', 'EMMA', 'ENYA', 'ELLA', 'ELON', 'ERIN', 'FLOYD', 'FRANK', 'GAGA',
      'GINA', 'GRACE', 'GWEN', 'IDRIS', 'IGGY', 'JAY', 'JLO', 'JOHN', 'JOJO', 'JUDE', 'KANYE', 'KATY', 'KIM', 'KYLIE', 'LANA',
      'LARRY', 'LIZZO', 'LORDE', 'LUKE', 'MALIA', 'MARK', 'MEL', 'MIKA', 'MILEY', 'NICK', 'NICKI', 'NOAH', 'OBAMA', 'OPRAH', 'ORA',
      'OWEN', 'PINK', 'POST', 'QUAVO', 'RITA', 'ROSS', 'SADE', 'SEAN', 'SHAWN', 'SIA', 'TATE', 'TYGA', 'TYLA', 'USHER', 'VERA',
      'VIN', 'WES', 'WILL', 'YARA', 'ZAYN', 'ELSA', 'LIAM', 'MEGAN', 'NINA', 'RUPA', 'SNOOP', 'TYRA', 'WIZ'
    ],
    medium: [
      'ALICIA', 'ALYSON', 'ARIANA', 'AVRIL', 'BALVIN', 'BIEBER', 'BILLY', 'BLAKE', 'BLOOM', 'BRANDO', 'BRUCE', 'BRYANT',
      'CAMILA', 'CARDI', 'CAREY', 'CARTER', 'CHANCE', 'COOPER', 'DAMIAN', 'DEVITO', 'DEXTER', 'DIESEL', 'DOLLY', 'DWAYNE',
      'ELLIOT', 'EMINEM', 'ESTHER', 'FALLON', 'FERGIE', 'FRASER', 'GARCIA', 'GARNER', 'GIBSON', 'GOMEZ', 'GORDON', 'GRAHAM',
      'HALSEY', 'HARRIS', 'HAYDEN', 'HEWITT', 'HILARY', 'HUGHES', 'HUDSON', 'HUNTER', 'JAGGER', 'JENNER', 'JEREMY', 'JESSIE',
      'JORDAN', 'JUSTIN', 'KARLIE', 'KEANU', 'KENDAL', 'KHALID', 'KIMORA', 'KYRIE', 'LEBRON', 'LENNON', 'LILNAS', 'LOPEZ',
      'LUPITA', 'MAGGIE', 'MARIAH', 'MARTIN', 'MEGHAN', 'MELINA', 'MIGUEL', 'MILLER', 'MONICA', 'MURPHY', 'NELSON', 'OLIVIA',
      'OSCAR', 'PABLO', 'PERRY', 'PORTER', 'PRATT', 'PRINCE', 'QUINN', 'RADCLI', 'REEVES', 'RENNER', 'RIDLEY', 'RIVERS',
      'ROBERT', 'RODMAN', 'RONNIE', 'SELENA', 'SANDRA', 'SANTOS', 'SAWYER', 'SEACRE', 'SHANIA', 'SHREYA', 'SIMONE', 'STYLES',
      'SWIFT', 'SYLVIA', 'TAYLOR', 'TELLER', 'THORNE', 'TIMBER', 'TREVOR', 'TYSON', 'URSULA', 'VERNON', 'VINNIE', 'WALKER',
      'WAYANS', 'WEBBER', 'WESLEY', 'WESTON', 'WINONA', 'WINFRE', 'XAVIER', 'YVETTE', 'ZAYDEN', 'BOWIE', 'CRUISE', 'ELTON',
      'GALLAG', 'JADEN', 'KANYEA', 'LUPIN', 'PHARRE', 'STEWAR', 'VIOLA'
    ],
    hard: [
      'BADBUNNY', 'BECKHAM', 'BENEDICT', 'BEYONCE', 'BRITNEY', 'CAMERON', 'CHASTAIN', 'CLOONEY', 'DANIELLE', 'DIONNE',
      'DJKHALED', 'EILISH', 'ESPOSITO', 'FERRERA', 'FLORENCE', 'FREEMAN', 'GILLIAN', 'GOSLING', 'HANNIBAL', 'HATHAWAY',
      'HENDRIX', 'HOLLAND', 'JACKMAN', 'JENNIFER', 'JESSICA', 'JOURDAN', 'KENDRICK', 'KIDMAN', 'KINGSTON', 'KRAVITZ',
      'LAURENCE', 'LILWAYNE', 'MADONNA', 'MAGUIRE', 'MALONE', 'MARGOT', 'MATTHEW', 'MCCARTHY', 'MCGREGOR', 'MICHAEL',
      'MICHELLE', 'MIRANDA', 'NATALIE', 'ORLANDO', 'PASCAL', 'PORTMAN', 'PRESLEY', 'QUEENLAT', 'RADCLIFF', 'RIHANNA',
      'ROLLING', 'RUSSELL', 'SANDLER', 'SCHUMER', 'SEINFELD', 'SERENAWI', 'SHEERAN', 'SNOOPDOG', 'SPENCER', 'STALLONE',
      'STREEP', 'TARANTIN', 'THOMPSON', 'TIMOTHEE', 'TRAVISSC', 'TURNER', 'VICTORIA', 'WILLIAMS', 'WINFREY', 'ZENDAYA',
      'ZUCKERB', 'ARMSTRON', 'BENNIFER', 'CHAPPELL', 'DAMON', 'FLORENZ', 'GALLAGHE', 'HARRISON', 'JONASBRO', 'KRISTEN',
      'MACRON', 'OPPENHE', 'PITTMAN', 'SANDOVAL', 'SPRADLEY', 'WINCHEST'
    ],
  },
  games: {
    easy: [
      'ABZU', 'ALBA', 'AMONG', 'ANNO', 'ASTRO', 'BABA', 'BALDI', 'BANJO', 'BLOON', 'BRAWL', 'CHESS', 'CLASH', 'CRAZY', 'DANCE',
      'DICEY', 'DONUT', 'DOOM', 'DOTA', 'FABLE', 'FEZ', 'FIFA', 'FROST', 'FUSER', 'GRIS', 'GUILD', 'HALO', 'HADES', 'ICO',
      'JOUST', 'JUMP', 'KATAM', 'KIRBY', 'LIMBO', 'LUMO', 'LUXOR', 'MAFIA', 'MARIO', 'MINES', 'NINJA', 'OKAMI', 'ORI', 'ORION',
      'OUTER', 'OXENF', 'PICO', 'POKER', 'PONG', 'QUAKE', 'RAFT', 'REACH', 'RISK', 'RUSH', 'SKATE', 'SLIME', 'SMASH', 'SONIC',
      'SPYRO', 'STEAM', 'STRAY', 'SUSHI', 'TERRA', 'TOKYO', 'TUNIC', 'UNO', 'VALOR', 'VIVA', 'WARIO', 'WORMS', 'YOSHI', 'ZELDA',
      'ZUMA', 'FROGGER', 'PACMAN', 'SIMS', 'TETRIS', 'TEMTEM', 'VECTREX'
    ],
    medium: [
      'ANIMAL', 'ARKHAM', 'ASTRAL', 'BATMAN', 'BORDER', 'BREATH', 'CASTLE', 'CHRONO', 'CITIES', 'CONTROL', 'CRASH', 'CUPHEAD',
      'DARKSID', 'DELTARU', 'DESTINY', 'DIABLO', 'DRAGON', 'ELDEN', 'FALLOUT', 'FARCRY', 'FIREEM', 'FORHONO', 'FORZA', 'GALAXY',
      'GEARS', 'GEOMETR', 'GODWAR', 'HOLLOW', 'HORIZON', 'INFAMY', 'INGRESS', 'INSIDE', 'ISLAND', 'JUSTDAN', 'KINGDOM',
      'KLONOA', 'LEAGUE', 'LEGACY', 'LEGEND', 'MADDEN', 'METROID', 'MONSTER', 'NARUTO', 'ODYSSEY', 'ORIGINS', 'OUTLAST',
      'OVERCOO', 'PAYDAY', 'PERSONA', 'PHASMOP', 'PILLARS', 'POKEMON', 'PORTAL', 'RATCHET', 'RESIDENT', 'ROBLOX', 'ROCKET',
      'SEKIRO', 'SHADOW', 'SHOVEL', 'SKYRIM', 'SPIDER', 'STARDEW', 'STARFOX', 'STREET', 'SUNSET', 'TACTIC', 'TOMBRAI',
      'TROPICO', 'UNCHART', 'VALHEIM', 'VANGUAR', 'WATCHDO', 'WITCHER', 'WOLFEN', 'YAKUZA', 'ZOMBIE', 'XENOBLA', 'ARCEUS',
      'CITIZEN', 'DRIFTER', 'HALCYON', 'STARCRA'
    ],
    hard: [
      'ASSASSIN', 'BATTLEFN', 'BAYONETT', 'BIOSHOCK', 'BLOODBOR', 'BORDERLD', 'CALLDUTY', 'CIVILIZA', 'CYBERPUN', 'DARKSOUL',
      'DEADSPAC', 'DISCOELI', 'DRAGONAG', 'DRAGONQU', 'ELDENRIN', 'EVILWITH', 'FINALFAN', 'FIREFEMB', 'FORTNITE', 'GEARSWAR',
      'GHOSTTSU', 'GODOFWAR', 'GUILTYGE', 'HALFLIFE', 'HARVESTM', 'IMMORTAL', 'JUSTCAUS', 'JUSTDANC', 'KINGDOMH', 'LASTOFUS',
      'LETHALCO', 'LITTLEBI', 'MASSEFEC', 'METALGEA', 'METROIDP', 'MINECRAF', 'MONHUNTR', 'MONSTERH', 'MORTALKO', 'NEEDSPED',
      'NIGHTINW', 'OVERWATC', 'PHASMOPH', 'RAINBOSI', 'REDDEADR', 'RIMWORLD', 'ROCKETLG', 'RUNESCAP', 'SILENTHL', 'SPIDERMN',
      'SPLATOON', 'STARFIEL', 'STARWARS', 'STREETFI', 'SUBNAUTI', 'SUNSHINE', 'SYSTEMSH', 'TERRARIA', 'TITANFAL', 'TOTALWAR',
      'TRANSIST', 'UNDERTAL', 'VALORANT', 'WARFRAME', 'WASTELAN', 'WATCHDOG', 'WOLFEINS', 'XCOMENEM', 'YAKUZAKI', 'ZELDABOT',
      'APEXLEGN', 'DEATHLOO', 'FORSPOK', 'REMNANT', 'RETURNAL', 'SABLE', 'SCORN', 'STRAYGOD'
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
