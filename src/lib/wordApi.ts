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
    3: [
      'CAT', 'DOG', 'SUN', 'CAR', 'BAT', 'HAT', 'RUN', 'FUN', 'BIG', 'RED',
      'JAM', 'BOX', 'MAP', 'ANT', 'LOG', 'HOT', 'ICE', 'NET', 'TIP', 'PEN',
      'CUP', 'BAG', 'TIN', 'PIG', 'OWL', 'FOX', 'JOY', 'SKY', 'TOY', 'DEN',
      'GEM', 'RAT', 'COW', 'BUG', 'BEE', 'HEN', 'POT', 'JAR', 'VAN', 'SAD',
      'MAD', 'TAP', 'CAP', 'NAP', 'LEG', 'ARM', 'EAR', 'EYE', 'SIP', 'RUN',
      'MIX', 'FIT', 'FUN', 'TOP', 'TIP', 'PAD', 'LID', 'OAK', 'ELF', 'ICE',
      'INK', 'JAW', 'KID', 'KIT', 'LIP', 'MAP', 'NET', 'NOD', 'OWL', 'PEA',
      'PIT', 'RUB', 'SAP', 'SIT', 'TAN', 'TIP', 'VET', 'WEB', 'WAX', 'YAK',
      'YUM', 'ZAP', 'ZEN', 'ACE', 'ACT', 'ADD', 'AGE', 'AID', 'ALE', 'ALL',
      'AND', 'ANT', 'ANY', 'APE', 'ARC', 'ARM', 'ART', 'ASH', 'ASK', 'AWE',
      'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BAY', 'BED', 'BEE', 'BEN', 'BET',
      'BIG', 'BIN', 'BIZ', 'BOB', 'BON', 'BOW', 'BOY', 'BUN', 'BUS', 'BUT',
      'BYE', 'CAB', 'CAM', 'CAN', 'CAP', 'CAR', 'CAT', 'COB', 'COD', 'COT',
      'COW', 'COY', 'CRY', 'CUP', 'CUT', 'DAB', 'DAD', 'DAM', 'DAY', 'DEN',
      'DID', 'DIM', 'DIN', 'DOG', 'DOT', 'DRY', 'DUB', 'DUE', 'EAR', 'EAT',
      'EGG', 'END', 'EVE', 'FAN', 'FAR', 'FAT', 'FAX', 'FAY', 'FED', 'FEE',
      'FEW', 'FIG', 'FIN', 'FIT', 'FLY', 'FOG', 'FOR', 'FUN', 'GAP', 'GAS',
      'GEL', 'GEM', 'GET', 'GIG', 'GUN', 'GUT', 'GUY', 'HAD', 'HAG', 'HAM',
      'HAS', 'HAT', 'HAY', 'HEM', 'HEN', 'HER', 'HID', 'HIM', 'HIP', 'HIT',
      'HOG', 'HOT', 'HUB', 'HUE', 'HUG', 'HUM', 'ICE', 'INK', 'JAR', 'JET'
    ],
    4: [
      'HOST','YEAR','FINE','BUSY','HILL','FIVE','WAKE','MENU','STAR','BLOW',
      'PAST','BOND','FULL','ROLE','CASE','WANT','THIS','JACK','TOLD','KEPT',
      'RELY','COPY','DUST','WERE','HUNT','LOGO','EARN','TRUE','GIVE','DICK',
      'LADY','EAST','OKAY','NECK','KNEE','FEET','TUNE','GROW','BEAT','FILE',
      'SAME','FREE','MEAN','KING','SUCH','ONLY','HELD','HOLE','MAIN','LOOK',
      'GAVE','CELL','SONG','KICK','WORE','LANE','THEN','FOOT','AREA','WEEK',
      'LAID','FACT','WHEN','WIRE','HIGH','GIFT','FACE','LIFE','HALL','WIDE',
      'TALK','SENT','PACE','WHOM','ELSE','NOTE','GOES','RICE','FOOD','HEAD',
      'KEEN','SOIL','TEAM','HAND','DUKE','RISE','JUST','PLUG','NEWS','DRUG',
      'PART','MILK','TOLL','GAIN','SORT','DUTY','RATE','IDEA','NAVY','KEEP',
      'FLOW','BOSS','YARD','EASY','SAVE','DOOR','VAST','GOLD','IRON','LAND',
      'LAST','FLAT','BUSH','BANK','THUS','KIND','SHOT','EDGE','PLOT','BATH',
      'FATE','DONE','PALM','TEST','MISS','SURE','GENE','HUNG','UPON','NAME',
      'CODE','PAIR','SHOP','LACK','PAGE','DISC','KNEW','PORT','ROAD','MADE',
      'READ','HUGE','RUTH','NONE','DROP','RANK','LAKE','PLAN','COLD','SOLE',
      'POST','FILM','FELT','HOME','PINK','BURN','NEED','LINK','SIDE','WEAK',
      'EACH','CAMP','MUCH','MANY','SEEN','THAT','ROLL','FUEL','WAIT','GREY',
      'HOLD','SELF','JEAN','LINE','FISH','TOOL','COOL','EXIT','SKIN','ZONE',
      'SEEK','CASH','MATT','HATE','HEAT','SEND','HAIR','MOON','FEEL','EVEN',
      'INCH','BEEN','TWIN','GIRL','LOAD','CREW','RULE','DATE','SOLD','HARM'
    ],
    5: [
      'LOOSE','SOUTH','SINCE','FAULT','FRAUD','STAKE','SENSE','GOING','THICK','HAPPY',
      'SUPER','LINKS','FLUID','INPUT','GREAT','BRAIN','BLACK','CLEAR','DEPTH','DRAWN',
      'NEVER','PROUD','ALARM','WOUND','APPLY','NOVEL','GRADE','SMALL','FLOOR','BRIEF',
      'WHICH','DREAM','AVOID','LAUGH','PAPER','EVERY','FORTH','SWEET','JOINT','BEGAN',
      'SHIFT','BUYER','FIRST','BASIS','ACUTE','LEARN','SPORT','CLEAN','OFTEN','CHAIN',
      'GREEN','PARTY','WORTH','BIRTH','SLEEP','MINUS','WRONG','WHOLE','REFER','NORTH',
      'WATER','OCEAN','COVER','SIZED','BOUND','WHITE','GROSS','SOLVE','DEBUT','THESE',
      'TRIES','ELITE','CYCLE','SUITE','MUSIC','YOUTH','HOUSE','THEIR','RANGE','CRASH',
      'BLIND','MOTOR','TOUGH','USAGE','SHOWN','GROWN','ASSET','DRINK','THEFT','PILOT',
      'ROYAL','EARTH','ROUTE','BEGUN','CHASE','GIVEN','BLOCK','RAPID','BROKE','ARGUE',
      'SPEND','RIVER','WORRY','ANGRY','RADIO','CROSS','AWARD','KNOWN','SIXTY','CLOCK',
      'TIRED','INDEX','PRIME','ADOPT','UNION','FINAL','MATCH','SHEET','PLATE','FRANK',
      'TRACK','STEAM','ARENA','HEART','IMAGE','OTHER','TWICE','THREW','GRANT','SOLID',
      'ISSUE','GRACE','PHONE','TABLE','COURT','MEDIA','SHELL','BLOOD','LEAVE','DANCE',
      'FORCE','MONEY','ERROR','QUITE','THEME','TEXAS','TRUTH','STRIP','TEETH','JONES',
      'PRIOR','QUICK','LEGAL','SPLIT','SHELF','FULLY','DOZEN','JAPAN','SPEAK','ABOUT',
      'BASES','ROBIN','STORY','BUILT','ALLOW','YOUNG','SHOOT','CHOSE','STOOD','SKILL',
      'THOSE','TITLE','OFFER','EXACT','BROWN','TOTAL','BRAND','GRAND','FRUIT','TOUCH',
      'WATCH','STAGE','FRAME','VISIT','SPOKE','AHEAD','HARRY','TOWER','TRULY','QUEEN',
      'COACH','PHOTO','MONTH','LAYER','CAUSE','APART','DEATH','HORSE','TIGHT','SPENT'
    ],
    6: [
      'CASTLE', 'FRIEND', 'NATURE', 'PEOPLE', 'MOTHER', 'FAMILY', 'GARDEN', 'SIMPLE', 'BRIDGE', 'ENERGY',
      'MARKET', 'POCKET', 'PLANET', 'LETTER', 'NUMBER', 'ANIMAL', 'FLOWER', 'BOTTLE', 'WINDOW', 'FUTURE',
      'SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'TUNNEL', 'STREET', 'BRANCH', 'STREAM', 'CANDLE', 'MARKER',
      'BREEZE', 'SECRET', 'PEACE', 'HEALTH', 'FRUITS', 'JUICES', 'MILKED', 'SCHOOL', 'BRIGHT', 'SHADOW',
      'SUNSET', 'SUNRISE', 'MORNING', 'EVENING', 'DINNER', 'LUNCH', 'COFFEE', 'TEACUP', 'JUNGLE', 'FOREST',
      'RIVERS', 'LAKES', 'HUNGER', 'THIRST', 'TRAVEL', 'STUDY', 'LEARN', 'TEACH',
      'WRITE', 'READS', 'MOVING', 'PLAYED', 'LOVELY', 'BLOSSOM', 'SEASIDE', 'BEAUTY', 'SPARKLE', 'HEARTY',
      'LIGHTS', 'CANDLE', 'MYSTIC', 'TREASURE', 'HOLIDAY', 'ORANGE', 'APPLE', 'BANANA', 'CHERRY', 'GRAPES',
      'LEMONS', 'PEACHY', 'PLANTS', 'FLOWER', 'ROSES', 'LILIES', 'VINES', 'TREES', 'LEAVES',
      'GRASS', 'BRIDGE', 'TUNNEL', 'ROCKS', 'HILLS', 'VALLEY', 'CANYON', 'FORESTS', 'JUNGLE', 'MEADOW',
      'FIELDS', 'GROVE', 'HEALTH', 'SLEEPY', 'DREAMS', 'WISHES', 'HAPPY', 'SADNESS', 'ANGER', 'FEARS',
      'BRAVES', 'KINDLY', 'FAITH', 'HOPE', 'PEACE', 'SAFETY', 'LOVELY', 'TRUST', 'HONEST', 'FAIRLY',
      'BRIGHT', 'DARKEN', 'LIGHT', 'SHADOW', 'GLOWING', 'SUNSET', 'STARRY', 'CLOUDS', 'RAINY',
      'SNOWY', 'CALM', 'STORM', 'THUNDER', 'FOOD', 'MEALS', 'DRINKS', 'SWEETS', 'TASTY', 'SPICES',
      'SALTY', 'FRUITS', 'BERRY', 'APPLE', 'LEMON', 'MELON', 'PEACH', 'GRAPE', 'OLIVE', 'PEARL',
      'STONES', 'ROCKY', 'HILLS', 'MOUNTS', 'BRIDGES', 'CANDLE', 'FLOWER', 'GARDEN', 'TREES', 'LEAVES',
      'GRASS', 'RIVERS', 'LAKES', 'OCEANS', 'ISLAND', 'SHORES', 'VALLEY', 'CANYON', 'DESERT', 'FOREST',
      'JUNGLE', 'MEADOW', 'FIELDS', 'TREES', 'GRASS', 'LEAVES', 'FLOWER', 'ROSES', 'LILIES', 'VINES',
      'GARDEN', 'SUNNY', 'RAINY', 'SNOWY', 'STORMY', 'CALM', 'BRAVE', 'KINDLY', 'HONEST', 'TRUST',
      'FAITH', 'HOPE', 'PEACE', 'LOVE', 'HAPPY', 'SADLY', 'FEARS', 'BRAVES', 'KINDLY', 'FAITH',
      'HOPE', 'PEACE', 'LOVELY', 'HAPPY', 'SADLY', 'ANGER', 'FEARS', 'JOYFUL', 'EXCITE', 'RELAX',
      'SLEEPY', 'DREAM', 'MAGIC', 'MYSTIC'
    ],
    7: [
      'ABILITY', 'BALANCE', 'CAPITAL', 'CARRIER', 'FANTASY', 'GENERAL', 'HAPPILY', 'JOURNEY', 'LIBRARY', 'MACHINE',
      'NATURAL', 'ORANGES', 'PICTURE', 'PLANTER', 'REMARKS', 'SCHOLAR', 'SECTION',
      'STUDENT', 'TEACHER','WINDOWS', 'YOUNGER', 'ADOPTED', 'ANIMAL',
      , 'BEDROOM', 'BETWEEN', 'BOTTLES', 'BRIDGES', 'BROWSER', 'CAPTURE', 'CHARGED', 'CHICKEN',
      'COMFORT', 'CONCERT', 'DANCING','DEALING', 'DIAGRAM',
      'DIALOGS', 'DIVERS', 'DROPLET', 'DURABLE', 'ELEVATE','EXAMPLE', 'EXCITED', 'EXPOSED',
      'FASHION', 'FEEDBACK', 'FESTIVE', 'FINANCE', 'FLIGHTY', 'FLOODED', 'FORCEFUL', 'FRIEND', 'GALLERY', 'GAMBLER',
      'GENTLE', 'GLITTER', 'GROCER', 'HARVEST', 'HARMONY', 'HORIZON', 'IMAGINE', 'IMPACT',
      'INFLAME', 'INSIGHT', 'JOURNAL','JUSTICE', 'KITCHEN', 'LANTERN', 'LIBERTY', 'LITERACY',
      'MAGNET', 'MATERIAL', 'MOMENT', 'MOTIVATE', 'MYSTERY', 'NATURAL', 'NOBLEST', 'OPINION', 'OUTLOOK', 'PARENT',
      'PEACEFUL', 'PENDANT', 'PILOTED', 'PLASTIC', 'POTENTIAL', 'PROGRESS', 'QUALITY', 'RADIANT', 'REMARK',
      'RENEWAL', 'RESEARCH', 'RESOLVE', 'SCHOOL', 'SENTIMENT', 'SIMPLE', 'SLEEPY', 'SOCIETY', 'SPEECH', 'STUDENT',
      'SUCCESS', 'SUSTAIN', 'TEACHER', 'THOUGHT', 'TOURISM', 'UNIQUE', 'UPGRADE', 'VIGOROUS', 'VILLAGE',
      'VISION', 'VITALITY', 'WISDOM', 'WORKSHOP', 'YOUTHFUL', 'ZEALOUS', 'ACCEPT', 'ADVISER', 'ALERTS', 'ANALYST',
      'APPROVE', 'ARTIST', 'ASSIST', 'ATTACK', 'BENDING', 'BILLION', 'BLOOMED', 'BRIGHT', 'BUNDLE', 'CAPTURE',
      'CARRIER', 'CLEANSE', 'CLOSET', 'CLOSER', 'CONVERT', 'CUPCAKE', 'DAMAGE', 'DARING', 'DEALER', 'DEARLY',
      'DIALOG', 'DROPLET', 'DURABLE', 'ELEVATE', 'EXAMPLE', 'EXCITED', 'EXPOSED', 'FASHION',
      'FEEDBACK', 'FESTIVE', 'FINANCE', 'FLIGHTY', 'FLOODED', 'FORCEFUL', 'FRIEND', 'GALLERY', 'GAMBLER',
      'GENTLE', 'GLITTER', 'GROCER', 'HARVEST', 'HARMONY', 'HORIZON', 'IMAGINE', 'IMPACT', 'INFLAME',
      'INSIGHT', 'JOURNAL', 'JUSTICE', 'KITCHEN', 'LANTERN', 'LIBERTY', 'LITERACY', 'MAGNET',
      'MATERIAL', 'MOMENT', 'MOTIVATE', 'MYSTERY', 'NATURAL', 'NOBLEST', 'OPINION', 'OUTLOOK', 'PARENT', 'PEACEFUL',
      'PENDANT', 'PILOTED', 'PLASTIC', 'POTENTIAL', 'PROGRESS', 'QUALITY', 'RADIANT', 'REMARK', 'RENEWAL',
      'RESEARCH', 'RESOLVE', 'SCHOOL', 'SENTIMENT', 'SIMPLE', 'SLEEPY', 'SOCIETY', 'SPEECH', 'STUDENT', 'SUCCESS',
      'SUSTAIN', 'TEACHER', 'THOUGHT', 'TOURISM', 'UNIQUE', 'UPGRADE', 'VIGOROUS', 'VILLAGE', 'VISION',
      'VITALITY', 'WISDOM', 'WORKSHOP', 'YOUTHFUL', 'ZEALOUS'
    ],
    8: [
      'ABSOLUTE', 'BALANCED', 'CAPACITY', 'DANGEROUS', 'ELEVATED', 'FANTASTIC', 'GENEROUS', 'HARMONIC', 'IMAGINED', 'JOURNEYS',
      'KITCHENS', 'LIBRARYS', 'NATURALS', 'OPINIONS', 'PERSISTS', 'QUIETEST', 'REMARKED', 'TEACHERS',
      'UPRIGHTS', 'VANISHED', 'WATERING', 'XENOPHOB', 'YOUTHFUL', 'ZODIACAL', 'ADMISSION', 'CONCERNS',
      'DEVELOPED', 'FRESHMEN', 'GATHERED', 'HIGHLAND', 'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING',
      'MATERIAL', 'NEUTRALS', 'OPINIONS', 'QUIETEST', 'REMARKED', 'TEACHERS', 'UPRIGHTS',
      'VANISHED', 'WATERING', 'XENOPHOB', 'YOUTHFUL', 'ZODIACAL', 'ADMISSION', 'CONCERNS', 'DEVELOPED',
      'FRESHMEN', 'GATHERED', 'HIGHLAND', 'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING', 'MATERIAL',
      'NEUTRALS', 'OPINIONS', 'QUIETEST', 'REMARKED', 'TEACHERS', 'UPRIGHTS', 'VANISHED',
      'WATERING', 'XENOPHOB', 'YOUTHFUL', 'ZODIACAL', 'ADMISSION', 'CONCERNS', 'DEVELOPED',
      'FRESHMEN', 'GATHERED', 'HIGHLAND', 'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING', 'MATERIAL', 'NEUTRALS',
      'OPINIONS', 'QUIETEST', 'REMARKED', 'TEACHERS', 'UPRIGHTS', 'VANISHED', 'WATERING',
      'XENOPHOB', 'YOUTHFUL', 'ZODIACAL', 'ADMISSION', 'CONCERNS', 'DEVELOPED', 'FRESHMEN',
      'GATHERED', 'HIGHLAND', 'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING', 'MATERIAL', 'NEUTRALS', 'OPINIONS',
      'QUIETEST', 'REMARKED', 'TEACHERS', 'UPRIGHTS', 'VANISHED', 'WATERING', 'XENOPHOB',
      'YOUTHFUL', 'ZODIACAL', 'ADMISSION', 'CONCERNS', 'DEVELOPED', 'FRESHMEN', 'GATHERED',
      'HIGHLAND', 'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING', 'MATERIAL', 'NEUTRALS', 'OPINIONS',
      'QUIETEST', 'REMARKED', 'TEACHERS', 'UPRIGHTS', 'VANISHED', 'WATERING', 'XENOPHOB', 'YOUTHFUL',
      'ZODIACAL', 'ADMISSION', 'CONCERNS', 'DEVELOPED', 'FRESHMEN', 'GATHERED', 'HIGHLAND',
      'IMAGINES', 'JOURNEYS', 'KITCHENS', 'LEARNING', 'MATERIAL', 'NEUTRALS', 'OPINIONS', 'QUIETEST',
      'REMARKED', 'TEACHERS', 'UPRIGHTS', 'VANISHED', 'WATERING', 'XENOPHOB', 'YOUTHFUL', 'ZODIACAL'
    ]
  },
  medium: {
    3: [
      'FOX','JOY','KEY','OWL','ZOO','FLY','SKY','TRY','BOX','SUN',
      'ANT','DNA','GAS','ION','PEG','WEB','BEE','ARC','FIG','HEN',
      'MAP','NAP','TOE','VAN','YAK','ZEN','ARC','RAT','TUB','BOT',
      'ELF','JAR','ARC','KID','LOG','MOT','NOD','OWL','PEG','RIM',
      'SIP','ICE','ARC','ARC','GAP','HUT','OAR','PEN','ARC','ARC'
    ],
    4: [
      'QUIZ','JADE','COZY','MYTH','FURY','PONY','LEVY','FLUX','NAVY','PREY',
      'MINT','LION','WOLF','TREE','BIRD','FIRE','MOON','STAR','RARE','EASY',
      'ACID','BASE','BOND','ATOM','FUNG','GENE','IRON',
      'GOLD','LEAD','TUBE','CELL','VIAL','PATH','TUBA','ZINC','AMYL','NOTE',
      'MINT','FOUR','BARK','LACE','GLOW','WAVE','COIL','BEEP','CORK','SNAP'
    ],
    5: [
      'AZURE','PROXY','QUIRK','ZESTY','FUDGE','GLYPH','JUMPY','KNELT','LYMPH','MIXED',
      'QUARK','PLANT','GLYPH','VIRUS','MOTIF','BRAIN','ALPHA','DELTA','SIGMA','NEON',
      'TRACE','FIELD','CRANE','TOKEN','PHASE','FORCE','POWER','SCOPE','GRAVY','VISTA',
      'SOLAR','LUNAR','OCEAN','RADIO','ATOMS','MOLAR','ENZYME','GENES','PRISM','STORM',
      'TERRA','AURUM','NOBLE','FIBER','LOGIC','CODES','CRYST','LAYER','DENSE','MOTEL'
    ],
    6: [
      'PLANET','BOTTLE','STREAM','MARKER','BRIDGE','LUNACY','GALAXY','FOSSIL','NEURON','TUNNEL'
      ,'ORANGE','GUITAR','MARKED','FIGURE','BRANCH','LETTER','SPIRIT','SCHOOL',
      'PRISMS','RADIOS','VECTOR','ELEMENT','CYCLIC','FORCES','ENERGY','SYSTEM','BRIGHT','MOTIVE',
      'CANDLE','JUNGLE','FOREST','RIVERS','WINDOW','NATURE','FAMILY','CASTLE','MORNING','EVENING',
      'STUDENT','TEACHER','HEALTH','FUTURE','BALANCE','ANIMAL','SPHERE','STRESS','INSIDE'
    ],
    7: [
      'JOURNEY','RAINBOW','FLOWERS','PICTURE','MACHINE','CHICKEN','BALANCE','LIBRARY','GENERAL','HAPPILY',
      'CAPTURE','NEUTRAL','TEACHER','STUDENT','TREASURE','MYSTERY','SUNSHINE','FANTASY','GARDENS',
      'LIBERATE','FREEDOM','HARVEST','ADVISORY','ANALYST','CREATOR','DISCOVER','DYNAMIC','EXPLORES','FOOTING',
      'IMAGINE','JOURNAL','KITCHEN','LEARNING','MATERIAL','NOTABLE','OPINION','PERSIST','QUANTUM','RESOURCE',
      'SHELTER','STORAGE','SYMPATHY','TRAVELER','UPRIGHTS','VIGOROUS','VISIONARY','WILDLIFE','YOUTHFUL','ZODIACAL'
    ],
    8: [
      'ABSOLUTE','BALANCED','CAPACITY','DANGEROUS','ELEVATED','FANTASTIC','GENEROUS','HARMONIC','IMAGINED','JOURNEYS',
      'KITCHENS','NATURALS','OPINIONS','PERSISTS','QUIETEST','REMARKED','TEACHERS',
      'UPRIGHTS','VANISHED','WATERING','YOUTHFUL','ADMISSION','CONCERNS','DEVELOPED','FRESHMEN',
      'GATHERED','HIGHLAND','IMAGINES','LEARNING','MATERIAL','NEUTRALS','OPINIONS','QUIETEST','REMARKED',
      'TEACHERS','UPRIGHTS','VANISHED','WATERING','YOUTHFUL','ZODIACAL','ADMISSION','CONCERNS','DEVELOPED'
    ]
  },
  hard: {
    3: [
      'ANT','BOT','CAT','DNA','ELF','FLU','GEM','HEN','ION','JAR',
      'KEY','LIP','MAP','NAP','OAK','PEN','RAT','SUN','TOE','URN',
      'VIA','WEB','YAK','ZEN','BEE','COG','FIG','GAS','HEX','JIG',
      'KID','LOG','MOT','NOD','OWL','PEG','RIM','SIP','TUB','VAN',
      'WAX','YEN','ZOO','ARC','ARC','ELM','FOG','GAP','HUT','ICE'
    ],
    4: [
      'ONYX','LYNX','JINX','CRUX','FLUX','HOAX','COAX','WAXY','FOXY','PIXY',
      'BILE','CELL','VIAL','PATH','TUBA','ZINC','AMYL','IRON','GOLD','LEAD',
      'MINT','LION','WOLF','TREE','BIRD','FIRE','MOON','STAR','RARE','EASY',
      'ACID','BASE','BOND','ATOM','FUNG','PLAS','PRIM','NEUR','GENE','VIRU'
    ],
    5: [
      'FJORD','WALTZ','NYMPH','GLYPH','LYMPH','CRYPT','PSYCH','MYRRH','HYMNS','GYPSY',
      'VIRUS','BACTE','CANCER','FUNGUS','PLASM','NEURON','GENOME','PRION','TUMOR','SPINE',
      'HEART','LUNGS','KIDNEY','BRAIN','PANCRE','SPINAL','STRESS','MUTANT','ENZYME','ANTIBO',
      'PATHOG','PROTEI','CARBON','NITROG','OXYGEN','SULFUR','PHOSPH','CHLORO','IODINE','HELIUM',
      'NITRIC','GLUCOSE','INSULIN','ADENINE','THYMINE','CYTOSI','GUANINE','URACIL','MITOSIS','MEIOSIS'
    ],
    6: [
      'ZYZZYVA', 'OXYMOR', 'QUAHOG', 'RHIZOID', 'SPHINX', 'PSYCHE', 'CRYPTA', 'NYMPHA', 'JACUZZ', 'FJORDS',
      'GLYPHS', 'KRYPTA', 'MNEMON', 'NACREY', 'QUINCE', 'VORTEX', 'XEROMA', 'ZEPHYR', 'LYMPHA', 'PSALMS',
      'AZOTIC', 'BIFIDA', 'CAUCUS', 'DEXTER', 'FUMBLE', 'GAZERS', 'HECTIC', 'IMBUED', 'JUNKET', 'KITTED',
      'LUXURY', 'MUTELY', 'NOCTUA', 'OBEYED', 'PYGMAL', 'QUIVER', 'RHUMBA', 'SQUASH', 'TYPHON', 'UMBRAL',
      'VEXING', 'WAXING', 'XYLOID', 'YAWNER', 'ZEALOT', 'BORSCH', 'CYPHER', 'DWELLS', 'EXODUS', 'FUMIST'
    ],
    7: [
      'SYZYGYR', 'PSYCHIC', 'MNEMONIC', 'CRYPTOID', 'PHOSPHOR', 'LYMPHAD', 'KRYPTONI', 'QUINCUNX', 'VORTEXED', 'JACUZZIS',
      'NITROUS', 'XERARCHY', 'ZEOLITIC', 'THALAMIC', 'OBFUSCAT', 'EXQUISIT', 'BIZARRES', 'QUIZZIFY', 'FUMIGANT', 'CRYPTIC',
      'FRACTAL', 'GALLIUM', 'HEXAGON', 'INVOKING', 'JUXTAPOS', 'KLUTZISH', 'LABYRINT', 'MEANDERS', 'NYMPHALI', 'OXYMORON',
      'PHANTASM', 'QUANTIFY', 'RHYTHMIC', 'SYNTHESI', 'TETRAGON', 'UMBRALED', 'VIBRATO', 'WHISPERY', 'XYLITOLS', 'ZEPHYRIN',
      'ACROSTIC', 'BESPEAKS', 'CIRCUITY', 'DIAPHANE', 'EUPHONIC', 'FERVENCY', 'GLACIERS', 'HYPHAEAN', 'IMMIXING', 'JUBILANT'
    ],
    8: [
      'PSYCHOSIS', 'MNEMONICS', 'CRYPTOLOGY', 'PHOSPHATE', 'LYMPHATIC', 'KRYPTONIC', 'QUADRUPLE', 'VORTICITY', 'JACUZZIES', 'NITROGENS',
      'XEROPHYTE', 'ZEALOTISM', 'THALAMUS', 'OBFUSCATE', 'EXQUISITE', 'BIZARRELY', 'QUIZZICAL', 'FUMIGATOR', 'CRYPTICAL', 'FRACTALS',
      'GALLIUMED', 'HEXAGONAL', 'INVOKINGS', 'JUXTAPOSE', 'KLUTZIEST', 'LABYRINTS', 'MEANDERED', 'NYMPHALIC', 'OXYMORONS', 'PHANTASMS',
      'QUANTIZED', 'RHYTHMICS', 'SYNTHESIS', 'TETRAGONAL', 'UMBRALESS', 'VIBRATORY', 'WHISPERED', 'XYLOPHONE', 'ZEPHYRANT', 'ACROSTICS',
      'BESPEAKING', 'CIRCUITRY', 'DIAPHANES', 'EUPHONIES', 'FERVENCED', 'GLACIATED', 'HYPHAEANS', 'IMMIXINGS', 'JUBILANCE', 'KNIGHTLY'
    ],
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