import type { Cell, PlacedWord, Puzzle } from './types';

export const SIZE = 12;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePuzzle(
  id: number,
  name: string,
  theme: string,
  accent: string,
  words: string[],
  seed: number,
): Puzzle {
  const rng = mulberry32(seed);
  const grid: string[][] = Array.from({ length: SIZE }, () => Array<string>(SIZE).fill(''));
  const placed: PlacedWord[] = [];
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (const word of sorted) {
    let done = false;
    for (let attempt = 0; attempt < 400 && !done; attempt++) {
      const [dr, dc] = DIRS[Math.floor(rng() * DIRS.length)];
      const len = word.length;
      const r0 = dr >= 0 ? 0 : len - 1;
      const r1 = dr <= 0 ? SIZE - 1 : SIZE - len;
      const c0 = dc >= 0 ? 0 : len - 1;
      const c1 = dc <= 0 ? SIZE - 1 : SIZE - len;
      if (r0 > r1 || c0 > c1) continue;
      const sr = r0 + Math.floor(rng() * (r1 - r0 + 1));
      const sc = c0 + Math.floor(rng() * (c1 - c0 + 1));
      const cells: Cell[] = [];
      let ok = true;
      for (let i = 0; i < len; i++) {
        const r = sr + dr * i;
        const c = sc + dc * i;
        const existing = grid[r][c];
        if (existing !== '' && existing !== word[i]) { ok = false; break; }
        cells.push({ row: r, col: c });
      }
      if (!ok) continue;
      for (let i = 0; i < len; i++) grid[cells[i].row][cells[i].col] = word[i];
      placed.push({ word, cells });
      done = true;
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(rng() * 26)];
    }
  }

  return { id, name, theme, accent, grid, words: placed };
}

export interface FaceDef {
  name: string;
  theme: string;
  accent: string;
  words: string[];
}

// A palette of accents reused across sets
const ACCENTS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

export const FACE_SETS: FaceDef[][] = [
  // Set 0 — original
  [
    { name: 'Cosmos', theme: 'The far reaches of space', accent: '#ef4444', words: ['NEBULA', 'QUASAR', 'PULSAR', 'COMET', 'ORBIT', 'GALAXY', 'ECLIPSE', 'METEOR', 'COSMOS', 'SOLAR'] },
    { name: 'Abyss', theme: 'The deep blue sea', accent: '#f97316', words: ['TSUNAMI', 'CORAL', 'MARLIN', 'ABYSS', 'KRAKEN', 'LAGOON', 'TRENCH', 'CURRENT', 'REEF', 'DEPTH'] },
    { name: 'Mythos', theme: 'Legends and gods', accent: '#3b82f6', words: ['HYDRA', 'ODYSSEY', 'ORACLE', 'SPHINX', 'TITAN', 'CHIMERA', 'VALKYRIE', 'ASGARD', 'ELIXIR', 'RUNE'] },
    { name: 'Cipher', theme: 'Machines and code', accent: '#22c55e', words: ['QUANTUM', 'BINARY', 'CIPHER', 'KERNEL', 'NEURAL', 'VECTOR', 'PIXEL', 'LOGIC', 'MATRIX', 'SYNTAX'] },
    { name: 'Flora', theme: 'Wild earth and green', accent: '#eab308', words: ['BLOSSOM', 'CANYON', 'GLACIER', 'MEADOW', 'THICKET', 'WILLOW', 'ORCHID', 'SAVANNA', 'DUNE', 'FERN'] },
    { name: 'Gusto', theme: 'Flavors of the kitchen', accent: '#cbd5e1', words: ['SAFFRON', 'RAVIOLI', 'BAGUETTE', 'TRUFFLE', 'GINGER', 'BASIL', 'CLOVE', 'UMAMI', 'PESTO', 'ROAST'] },
  ],
  // Set 1
  [
    { name: ' Safari', theme: 'Animals of the savanna', accent: ACCENTS[0], words: ['LION', 'ZEBRA', 'ELEPHANT', 'GIRAFFE', 'CHEETAH', 'BUFFALO', 'GAZELLE', 'LEOPARD', 'RHINO', 'BABOON'] },
    { name: 'Frost', theme: 'Frozen worlds', accent: ACCENTS[4], words: ['GLACIER', 'BLIZZARD', 'FROST', 'AVALANCHE', 'ICEBERG', 'TUNDRA', 'PERMAFROST', 'SNOWFALL', 'CRYSTAL', 'POLAR'] },
    { name: 'Tempo', theme: 'Music and rhythm', accent: ACCENTS[2], words: ['RHYTHM', 'MELODY', 'HARMONY', 'TEMPO', 'CADENCE', 'OCTAVE', 'CHORD', 'CRESCENDO', 'BALLAD', 'SONATA'] },
    { name: 'Forge', theme: 'Metal and craft', accent: ACCENTS[6], words: ['ANVIL', 'FORGE', 'HAMMER', 'MOLTEN', 'SMITH', 'BLADE', 'CASTING', 'ALLOY', 'TEMPER', 'CRUCIBLE'] },
    { name: 'Bloom', theme: 'Garden flowers', accent: ACCENTS[3], words: ['TULIP', 'DAISY', 'LAVENDER', 'POPPY', 'JASMINE', 'DAHLIA', 'PEONY', 'MARIGOLD', 'IRIS', 'PETUNIA'] },
    { name: 'Storm', theme: 'Wild weather', accent: ACCENTS[7], words: ['THUNDER', 'LIGHTNING', 'TORNADO', 'HURRICANE', 'CYCLONE', 'TEMPEST', 'MONSOON', 'DROUGHT', 'HAILSTORM', 'GALE'] },
  ],
  // Set 2
  [
    { name: 'Castle', theme: 'Medieval realm', accent: ACCENTS[4], words: ['KNIGHT', 'CASTLE', 'DRAGON', 'SWORD', 'SHIELD', 'TOWER', 'MOAT', 'BANNER', 'ARMOR', 'SIEGE'] },
    { name: 'Surf', theme: 'Ocean waves', accent: ACCENTS[5], words: ['WAVE', 'SURF', 'TIDAL', 'BARREL', 'RIPCURRENT', 'SWELL', 'REEF', 'SALTWATER', 'FOAM', 'SHOREBREAK'] },
    { name: 'Spice', theme: 'World spices', accent: ACCENTS[1], words: ['PAPRIKA', 'TURMERIC', 'CARDAMOM', 'CUMIN', 'CINNAMON', 'NUTMEG', 'CLOVE', 'SAFFRON', 'CORIANDER', 'WASABI'] },
    { name: 'Pulse', theme: 'City nightlife', accent: ACCENTS[8], words: ['NEON', 'SKYLINE', 'SUBWAY', 'BOULEVARD', 'PIER', 'ROOFTOP', 'MIDNIGHT', 'FLICKER', 'CONCRETE', 'SIGNAL'] },
    { name: 'Canopy', theme: 'Rainforest life', accent: ACCENTS[3], words: ['JAGUAR', 'CANOPY', 'ORCHID', 'MACAW', 'TAPIR', 'BROMELIAD', 'CHAMELEON', 'VINE', 'MONKEY', 'FERN'] },
    { name: 'Vault', theme: 'Banking and gold', accent: ACCENTS[9], words: ['VAULT', 'BULLION', 'LEDGER', 'TREASURY', 'COIN', 'MINT', 'BONDS', 'RESERVE', 'BULL', 'DIVIDEND'] },
  ],
  // Set 3
  [
    { name: 'Desert', theme: 'Sand and sun', accent: ACCENTS[1], words: ['DUNE', 'OASIS', 'MIRAGE', 'CARAVAN', 'CAMEL', 'SCORPION', 'SANDSTORM', 'MESA', 'CACTUS', 'ARROYO'] },
    { name: 'Norse', theme: 'Viking legends', accent: ACCENTS[4], words: ['THOR', 'ODIN', 'VALHALLA', 'RUNE', 'FJORD', 'LONGSHIP', 'BERSERKER', 'YGGDRASIL', 'MIDGARD', 'RAGNAROK'] },
    { name: 'Pixel', theme: 'Retro gaming', accent: ACCENTS[6], words: ['PIXEL', 'SPRITE', 'JOYSTICK', 'CARTRIDGE', 'BOSS', 'LEVEL', 'COMBO', 'POWERUP', 'CHECKPOINT', 'COIN'] },
    { name: 'Petals', theme: 'Spring bloom', accent: ACCENTS[7], words: ['BLOSSOM', 'PETAL', 'STAMEN', 'POLLEN', 'BUD', 'BLOOM', 'SPRING', 'CHERRY', 'LILAC', 'BEE'] },
    { name: 'Harbor', theme: 'Ships and docks', accent: ACCENTS[5], words: ['ANCHOR', 'HARBOR', 'GALLEON', 'LANTERN', 'PIER', 'CARGO', 'TIDE', 'BEACON', 'WAKE', 'RIGGING'] },
    { name: 'Circuit', theme: 'Electronics', accent: ACCENTS[3], words: ['CIRCUIT', 'TRANSISTOR', 'RESISTOR', 'CAPACITOR', 'SOLDER', 'VOLTAGE', 'DIODE', 'RELAY', 'BREADBOARD', 'TRACE'] },
  ],
  // Set 4
  [
    { name: 'Volcano', theme: 'Fire and earth', accent: ACCENTS[0], words: ['LAVA', 'MAGMA', 'CRATER', 'ERUPTION', 'ASH', 'PUMICE', 'GEYSER', 'FUMAROLE', 'BASALT', 'CALDERA'] },
    { name: 'Arctic', theme: 'Polar frontier', accent: ACCENTS[5], words: ['IGLOO', 'AURORA', 'ICEFLOE', 'PENGUIN', 'NARWHAL', 'TUNDRA', 'BLIZZARD', 'PERMAFROST', 'GLACIER', 'POLAR'] },
    { name: 'Throne', theme: 'Royal courts', accent: ACCENTS[9], words: ['CROWN', 'SCEPTER', 'THRONE', 'JESTER', 'HERALD', 'BANQUET', 'GAZEBO', 'REGENT', 'DUCHY', 'TOWER'] },
    { name: 'Symphony', theme: 'Orchestral sound', accent: ACCENTS[2], words: ['VIOLIN', 'CELLO', 'OBOW', 'TIMPANI', 'CONCERTO', 'OVERTURE', 'BATON', 'TRILL', 'PIZZICATO', 'CRESCENDO'] },
    { name: 'Coral', theme: 'Reef colors', accent: ACCENTS[7], words: ['CORAL', 'ANEMONE', 'ANGELFISH', 'SEAHORSE', 'PARROTFISH', 'STARFISH', 'URCHIN', 'LIONFISH', 'MANTA', 'WRAILLE'] },
    { name: 'Timber', theme: 'Forest wood', accent: ACCENTS[3], words: ['TIMBER', 'CABIN', 'PINE', 'CEDAR', 'MAPLE', 'BIRCH', 'SAW', 'LODGE', 'CAMPSITE', 'KINDLING'] },
  ],
  // Set 5
  [
    { name: 'Galaxy', theme: 'Stars above', accent: ACCENTS[4], words: ['GALAXY', 'ASTEROID', 'SUPERNOVA', 'BLACKHOLE', 'NEBULA', 'ORION', 'POLARIS', 'COMET', 'ZODIAC', 'EQUINOX'] },
    { name: 'Bakery', theme: 'Oven-fresh', accent: ACCENTS[9], words: ['SOURDOUGH', 'CROISSANT', 'BAGEL', 'BRIOCHE', 'PRETZEL', 'TART', 'CRUST', 'YEAST', 'KNEAD', 'LOAF'] },
    { name: 'Samurai', theme: 'Feudal Japan', accent: ACCENTS[0], words: ['SAMURAI', 'KATANA', 'SHOGUN', 'RONIN', 'BUSHIDO', 'SENSEI', 'NINJA', 'TEMPLE', 'CHERRY', 'TORII'] },
    { name: 'Glacier', theme: 'Ice fields', accent: ACCENTS[5], words: ['GLACIER', 'CREVASSE', 'SERAC', 'MORAIN', 'ICEFALL', 'AVALANCHE', 'FJORD', 'CIRQUE', 'GLACIOLOGIST', 'SNOWLINE'] },
    { name: 'Jungle', theme: 'Dense wild', accent: ACCENTS[3], words: ['JAGUAR', 'PANTHER', 'VINE', 'CANOPY', 'TARZAN', 'GORILLA', 'PARROT', 'MONKEY', 'BOA', 'TAPIR'] },
    { name: 'Stadium', theme: 'Arena sports', accent: ACCENTS[2], words: ['STADIUM', 'BLEACHER', 'HALFTIME', 'TOUCHDOWN', 'GOALKEEPER', 'REFEREE', 'WHISTLE', 'JERSEY', 'CLEATS', 'TROPHY'] },
  ],
  // Set 6
  [
    { name: 'Lighthouse', theme: 'Coastal guides', accent: ACCENTS[9], words: ['BEACON', 'LANTERN', 'FOG', 'KEEPER', 'HELIX', 'GALLERY', 'ROCKS', 'TIDE', 'SHIPWRECK', 'STORM'] },
    { name: 'Pharaoh', theme: 'Ancient Egypt', accent: ACCENTS[1], words: ['PHARAOH', 'PYRAMID', 'SPHINX', 'MUMMY', 'SCARAB', 'OBELISK', 'HIEROGLYPH', 'ANKH', 'NILE', 'SARCOPHAGUS'] },
    { name: 'Coffee', theme: 'Brewed beans', accent: ACCENTS[5], words: ['ESPRESSO', 'LATTE', 'MOCHA', 'CARAFE', 'BARISTA', 'CREMA', 'ROAST', 'GRIND', 'DECAF', 'CREMANT'] },
    { name: 'Compass', theme: 'Navigation', accent: ACCENTS[4], words: ['COMPASS', 'BEARING', 'AZIMUTH', 'MERIDIAN', 'CARDINAL', 'ORIENT', 'ASTROLABE', 'SEXTANT', 'TRIANGULATION', 'WAYPOINT'] },
    { name: 'Winery', theme: 'Vineyard harvest', accent: ACCENTS[7], words: ['VINEYARD', 'GRAPE', 'BARREL', 'CORK', 'BOUQUET', 'TANNIN', 'VINTAGE', 'CELLAR', 'FERMENT', 'TERROIR'] },
    { name: 'Quasar', theme: 'Deep space', accent: ACCENTS[6], words: ['QUASAR', 'PULSAR', 'BLAZAR', 'MAGNETAR', 'NEUTRON', 'REDSHIFT', 'PARSEC', 'SINGULARITY', 'EVENTHORIZON', 'VOID'] },
  ],
  // Set 7
  [
    { name: 'Rodeo', theme: 'Wild west', accent: ACCENTS[1], words: ['BRONCO', 'LASSO', 'COWBOY', 'SHERIFF', 'SALOON', 'CANYON', 'BOOT', 'SPUR', 'RANCH', 'STEER'] },
    { name: 'Orchard', theme: 'Fruit trees', accent: ACCENTS[3], words: ['APPLE', 'PEAR', 'CHERRY', 'PEACH', 'PLUM', 'ORCHARD', 'BLOSSOM', 'HARVEST', 'GRAFT', 'CIDER'] },
    { name: 'Nebula', theme: 'Cosmic clouds', accent: ACCENTS[7], words: ['NEBULA', 'ORION', 'HELIX', 'CRAB', 'EAGLE', 'RING', 'CATSEYE', 'PELIAN', 'LAGOON', 'DUMBBELL'] },
    { name: 'Stadium', theme: 'Track and field', accent: ACCENTS[2], words: ['SPRINT', 'HURDLE', 'JAVELIN', 'DISCUS', 'MARATHON', 'RELAY', 'VAULT', 'SHOTPUT', 'STADIUM', 'LANE'] },
    { name: 'Bonsai', theme: 'Miniature trees', accent: ACCENTS[5], words: ['BONSAI', 'PRUNE', 'ZEN', 'JUNIPER', 'PINE', 'MAPLE', 'CEDAR', 'TRAY', 'SCISSORS', 'GRAFT'] },
    { name: 'Cipher', theme: 'Cryptography', accent: ACCENTS[6], words: ['CIPHER', 'ENIGMA', 'KEY', 'NONCE', 'SALT', 'HASH', 'ENTROPY', 'CIPHERTEXT', 'PLAINTEXT', 'BLOCK'] },
  ],
  // Set 8
  [
    { name: 'Tundra', theme: 'Cold plains', accent: ACCENTS[5], words: ['TUNDRA', 'REINDEER', 'MUSKOX', 'WILLOW', 'LICHEN', 'PERMAFROST', 'LEMMING', 'ARCTIC', 'WOLF', 'PTARMIGAN'] },
    { name: 'Distillery', theme: 'Spirits', accent: ACCENTS[9], words: ['WHISKEY', 'BOURBON', 'SCOTCH', 'COPPER', 'STILL', 'MASH', 'BARREL', 'RYE', 'PROOF', 'ANGELSHARE'] },
    { name: 'Circus', theme: 'Big top', accent: ACCENTS[0], words: ['CIRCUS', 'CLOWN', 'TRAPEZE', 'TENT', 'ACROBAT', 'JUGGLER', 'TAMER', 'STILT', 'UNICYCLE', 'RINGMASTER'] },
    { name: 'Mine', theme: 'Underground', accent: ACCENTS[6], words: ['SHAFT', 'ORE', 'CART', 'PICKAXE', 'TUNNEL', 'VEIN', 'LANTERN', 'SEAM', 'QUARTZ', 'DRIFT'] },
    { name: 'Fjord', theme: 'Norway coast', accent: ACCENTS[4], words: ['FJORD', 'GLACIER', 'FERRY', 'STAVE', 'TROLL', 'AURORA', 'VIKING', 'SALMON', 'CLIFF', 'FISHING'] },
    { name: 'Bistro', theme: 'French dining', accent: ACCENTS[2], words: ['BISTRO', 'CRÊPE', 'BÉCHAMEL', 'QUICHE', 'RATATOUILLE', 'BAGUETTE', 'CROISSANT', 'ESPRESSO', 'BRÛLÉE', 'MIREPOIX'] },
  ],
  // Set 9
  [
    { name: 'Raptor', theme: 'Birds of prey', accent: ACCENTS[0], words: ['EAGLE', 'HAWK', 'FALCON', 'OWL', 'OSPREY', 'KITE', 'HARRIER', 'VULTURE', 'TALON', 'BEAK'] },
    { name: 'Aurora', theme: 'Northern lights', accent: ACCENTS[5], words: ['AURORA', 'BOREALIS', 'POLAR', 'MAGNETIC', 'IONOSPHERE', 'SOLARWIND', 'GREEN', 'CURTAIN', 'NIGHT', 'ZENITH'] },
    { name: 'Coral', theme: 'Reef builders', accent: ACCENTS[7], words: ['POLYP', 'CORAL', 'ZOOXANTHELLA', 'REEF', 'ATOLL', 'FRINGE', 'BLEACH', 'SPAWN', 'CALCIUM', 'COLONY'] },
    { name: 'Kiln', theme: 'Pottery craft', accent: ACCENTS[1], words: ['KILN', 'POTTER', 'CLAY', 'GLAZE', 'WHEEL', 'FIRING', 'CERAMIC', 'MOLD', 'SLIP', 'BISQUE'] },
    { name: 'Loom', theme: 'Weaving', accent: ACCENTS[8], words: ['LOOM', 'WEAVE', 'SHUTTLE', 'WARP', 'WEFT', 'SPIN', 'DYED', 'BOBBIN', 'HEDDLE', 'TAPESTRY'] },
    { name: 'Safari', theme: 'African plains', accent: ACCENTS[3], words: ['SAVANNA', 'ACACIA', 'WILDEBEEST', 'ZEBRA', 'GIRAFFE', 'CHEETAH', 'MEERKAT', 'WARTHOG', 'OKAPI', 'BAOBAB'] },
  ],
  // Set 10
  [
    { name: 'Gallop', theme: 'Horse country', accent: ACCENTS[9], words: ['GALLOP', 'TROT', 'CANTER', 'STALLION', 'MARE', 'FOAL', 'PASTURE', 'BRIDLE', 'SADDLE', 'MANE'] },
    { name: 'Nebula', theme: 'Star nurseries', accent: ACCENTS[7], words: ['NEBULA', 'PROPLYD', 'STELLAR', 'HYDROGEN', 'DUST', 'GLOW', 'CLUSTER', 'COSMIC', 'ION', 'BIRTH'] },
    { name: 'Temple', theme: 'Ancient Greece', accent: ACCENTS[4], words: ['PARTHENON', 'ATHENA', 'ZEUS', 'ORACLE', 'COLUMN', 'MARBLE', 'ACROPOLIS', 'AMPHORA', 'OLYMPIA', 'HELLENIC'] },
    { name: 'Quartz', theme: 'Crystals and gems', accent: ACCENTS[6], words: ['QUARTZ', 'AMETHYST', 'GEODE', 'CITRINE', 'AGATE', 'JASPER', 'OBSIDIAN', 'FLUORITE', 'TOURMALINE', 'GARNET'] },
    { name: 'Pampas', theme: 'South plains', accent: ACCENTS[3], words: ['PAMPAS', 'GAUCHO', 'LLAMA', 'RHEA', 'GRASSLAND', 'ESTANCIA', 'CUY', 'VICUNA', 'CONDOR', 'PATAGONIA'] },
    { name: 'Brigade', theme: 'Firefighting', accent: ACCENTS[0], words: ['HOSE', 'LADDER', 'AXE', 'PYRO', 'ASBORN', 'SMOKE', 'ALARMS', 'RESCUE', 'PUMPER', 'BAZAR'] },
  ],
  // Set 11
  [
    { name: 'Monsoon', theme: 'Rainy season', accent: ACCENTS[4], words: ['MONSOON', 'DELUGE', 'PADDY', 'RICE', 'MUDSLIDE', 'TERRARIUM', 'DELTA', 'LEVEE', 'CLOUDBURST', 'GUST'] },
    { name: 'Citadel', theme: 'Fortress', accent: ACCENTS[9], words: ['CITADEL', 'RAMPART', 'BASTION', 'GARRISON', 'KEEP', 'MOAT', 'PORTCULLIS', 'WARDEN', 'BATTLEMENT', 'DONJON'] },
    { name: 'Polaris', theme: 'Guiding star', accent: ACCENTS[5], words: ['POLARIS', 'NORTHSTAR', 'BIGDIPPER', 'URSA', 'CASSIOPEIA', 'CEPHEUS', 'DRACO', 'LYRA', 'CYGNUS', 'MERAK'] },
    { name: 'Cocoa', theme: 'Chocolate', accent: ACCENTS[1], words: ['COCOA', 'CACAO', 'TRUFFLE', 'GANACHE', 'TEMPER', 'MOLD', 'PRALINE', 'BONBON', 'NIB', 'ROAST'] },
    { name: 'Meadow', theme: 'Open fields', accent: ACCENTS[3], words: ['MEADOW', 'BUTTERCUP', 'CLOVER', 'BEE', 'LARK', 'BUTTERFLY', 'THISTLE', 'DAISY', 'BLUEBELL', 'SUNBEAM'] },
    { name: 'Gears', theme: 'Clockwork', accent: ACCENTS[6], words: ['GEAR', 'SPRING', 'PENDULUM', 'ESCAPEMENT', 'COGS', 'WIND', 'TICK', 'DIAL', 'BALANCE', 'JEWEL'] },
  ],
  // Set 12
  [
    { name: 'Voyage', theme: 'Sea journeys', accent: ACCENTS[4], words: ['VOYAGE', 'GALLEON', 'COMPASS', 'HORIZON', 'ANCHOR', 'CAPTAIN', 'RIGGING', 'CABIN', 'CHART', 'BEARING'] },
    { name: 'Mosaic', theme: 'Tile art', accent: ACCENTS[8], words: ['MOSAIC', 'TILE', 'GROUT', 'GLASS', 'PATTERN', 'FRESCO', 'CEMENT', 'INLAY', 'EMBELLISH', 'MURALS'] },
    { name: 'Onyx', theme: 'Dark stones', accent: ACCENTS[0], words: ['ONYX', 'OBSIDIAN', 'JET', 'BASALT', 'GRANITE', 'SLATE', 'MARBLE', 'HEMATITE', 'AGATE', 'TOURMALINE'] },
    { name: 'Glade', theme: 'Forest clearing', accent: ACCENTS[3], words: ['GLADE', 'OAK', 'STREAM', 'MOSS', 'FERN', 'ROBIN', 'BIRCH', 'STOAT', 'TOADSTOOL', 'BREEZE'] },
    { name: 'Sonata', theme: 'Piano works', accent: ACCENTS[2], words: ['SONATA', 'KEY', 'PEDAL', 'PRELUDE', 'FUGUE', 'ETUDE', 'CHORD', 'ARPEGGIO', 'SUSTAIN', 'PIANO'] },
    { name: 'Pilgrim', theme: 'Old journeys', accent: ACCENTS[9], words: ['PILGRIM', 'CLOAK', 'STAFF', 'CHALICE', 'SHRINE', 'CANDLE', 'ABBOT', 'MANUSCRIPT', 'GARGOYLE', 'CLOISTER'] },
  ],
  // Set 13
  [
    { name: 'Reef', theme: 'Coral seas', accent: ACCENTS[5], words: ['REEF', 'POLYP', 'ANGELFISH', 'SEAURCHIN', 'CLOWNFISH', 'WRAILLE', 'MANTA', 'STINGRAY', 'CONCH', 'ANEMONE'] },
    { name: 'Canyon', theme: 'Carved rock', accent: ACCENTS[1], words: ['CANYON', 'BUTTE', 'MESA', 'GOUGE', 'RAPIDS', 'PUEBLO', 'ARCH', 'SANDSTONE', 'VISTA', 'LEDGE'] },
    { name: 'Nebula', theme: 'Deep clouds', accent: ACCENTS[7], words: ['NEBULA', 'GALAXY', 'PILLAR', 'COSMIC', 'DUST', 'EMISSION', 'REFLECTION', 'PLANETARY', 'SUPERNOVA', 'PHOTON'] },
    { name: 'Vine', theme: 'Grape vines', accent: ACCENTS[3], words: ['VINE', 'TENDRIL', 'GRAPE', 'LEAF', 'CLUSTER', 'TRELLIS', 'PRUNE', 'CANOPY', 'ROOT', 'SOMMELIER'] },
    { name: 'Helix', theme: 'DNA spiral', accent: ACCENTS[6], words: ['HELIX', 'GENE', 'CODON', 'PROTEIN', 'RIBOSOME', 'ENZYME', 'NUCLEUS', 'CHROMOSOME', 'MITOSIS', 'STRAND'] },
    { name: 'Bazaar', theme: 'Marketplace', accent: ACCENTS[9], words: ['BAZAAR', 'CARPET', 'SPICE', 'LANTERN', 'MERCHANT', 'HAGGLE', 'SILK', 'COPPER', 'BARGAIN', 'STALL'] },
  ],
  // Set 14
  [
    { name: 'Comet', theme: 'Icy travelers', accent: ACCENTS[5], words: ['COMET', 'NUCLEUS', 'COMA', 'TAIL', 'ORBIT', 'PERIHELION', 'OORT', 'METEOR', 'ICE', 'DUST'] },
    { name: 'Lagoon', theme: 'Calm waters', accent: ACCENTS[8], words: ['LAGOON', 'SAND', 'PALM', 'TIDAL', 'BRACKISH', 'MANGROVE', 'REEF', 'HERON', 'CRAB', 'SHALLOWS'] },
    { name: 'Crown', theme: 'Kings and queens', accent: ACCENTS[9], words: ['CROWN', 'SCEPTER', 'ORB', 'ROBE', 'CORONATION', 'REGENT', 'PALACE', 'HERALD', 'VASSAL', 'BANQUET'] },
    { name: 'Spruce', theme: 'Conifer woods', accent: ACCENTS[3], words: ['SPRUCE', 'PINE', 'FIR', 'CEDAR', 'HEMLOCK', 'CONIFER', 'NEEDLE', 'CONE', 'RESIN', 'BARK'] },
    { name: 'Tavern', theme: 'Old inns', accent: ACCENTS[1], words: ['TAVERN', 'ALE', 'BARMAID', 'HEARTH', 'STEW', 'BREAD', 'MUG', 'LUTE', 'STRANGER', 'ROOM'] },
    { name: 'Zephyr', theme: 'Gentle winds', accent: ACCENTS[4], words: ['ZEPHYR', 'BREEZE', 'GUST', 'SQUALL', 'TRADEWIND', 'DRAFT', 'WHIRLWIND', 'MISTRAL', 'SIROCCO', 'MONSOON'] },
  ],
  // Set 15
  [
    { name: 'Orbit', theme: 'Around the planet', accent: ACCENTS[4], words: ['ORBIT', 'SATELLITE', 'APOGEE', 'PERIGEE', 'STATION', 'THRUSTER', 'SOLAR', 'TELEMETRY', 'DOCKING', 'EVA'] },
    { name: 'Bamboo', theme: 'Asian grove', accent: ACCENTS[3], words: ['BAMBOO', 'PANDA', 'GROVE', 'SHOOT', 'PITH', 'WEAVE', 'FLUTE', 'TORII', 'CRANE', 'KOI'] },
    { name: 'Furnace', theme: 'Heat and forge', accent: ACCENTS[0], words: ['FURNACE', 'BURNER', 'FORGE', 'BLAST', 'CRUCIBLE', 'INGOT', 'COKE', 'SLAG', 'BELLOWS', 'HEARTH'] },
    { name: 'Oasis', theme: 'Desert water', accent: ACCENTS[5], words: ['OASIS', 'PALM', 'SPRING', 'DATE', 'CAMEL', 'POOL', 'SHADE', 'BEDOUIN', 'TENT', 'DUNE'] },
    { name: 'Cello', theme: 'Strings', accent: ACCENTS[2], words: ['CELLO', 'BOW', 'ROSIN', 'PEG', 'FINGERBOARD', 'BRIDGE', 'CHORD', 'VIBRATO', 'PIZZICATO', 'CONCERTO'] },
    { name: 'Quill', theme: 'Old writing', accent: ACCENTS[9], words: ['QUILL', 'INK', 'PARCHMENT', 'SCROLL', 'WAX', 'SCRIBE', 'MANUSCRIPT', 'BLOTTER', 'CALLIGRAPHY', 'LEDGER'] },
  ],
  // Set 16
  [
    { name: 'Nebula', theme: 'Star dust', accent: ACCENTS[7], words: ['NEBULA', 'ORION', 'STARDUST', 'HYDROGEN', 'IONIZED', 'EMISSION', 'DARKCLOUD', 'PROPLYD', 'GLOW', 'PARSEC'] },
    { name: 'Pearl', theme: 'Ocean gems', accent: ACCENTS[5], words: ['PEARL', 'OYSTER', 'NACRE', 'LUSTER', 'MOLLUSK', 'CULTURED', 'ABALONE', 'DIVER', 'LAGOON', 'SHELL'] },
    { name: 'Sentry', theme: 'Watchmen', accent: ACCENTS[0], words: ['SENTRY', 'GUARD', 'WATCHTOWER', 'PATROL', 'BEACON', 'ALARM', 'GATE', 'RAMPART', 'WARDEN', 'SIGNAL'] },
    { name: 'Mint', theme: 'Herb garden', accent: ACCENTS[3], words: ['MINT', 'BASIL', 'THYME', 'ROSEMARY', 'SAGE', 'OREGANO', 'PARSLEY', 'DILL', 'CILANTRO', 'CHERVIL'] },
    { name: 'Rapid', theme: 'White water', accent: ACCENTS[4], words: ['RAPID', 'KAYAK', 'RAFT', 'PADDLE', 'EDDY', 'CURRENT', 'GORGE', 'PORTAGE', 'SPRAY', 'HELLER'] },
    { name: 'Goblet', theme: 'Feast hall', accent: ACCENTS[9], words: ['GOBLET', 'CHALICE', 'BANQUET', 'ROAST', 'MEAD', 'BREAD', 'TRENCHER', 'JESTER', 'HARPER', 'DRAUGHT'] },
  ],
  // Set 17
  [
    { name: 'Drift', theme: 'Snow drifts', accent: ACCENTS[5], words: ['DRIFT', 'SNOW', 'BANK', 'FLAKE', 'BLIZZARD', 'CRUST', 'GLACIER', 'WINDSLAB', 'POWDER', 'SERAC'] },
    { name: 'Hearth', theme: 'Home fires', accent: ACCENTS[1], words: ['HEARTH', 'KINDLING', 'LOG', 'EMBER', 'FLUE', 'POKER', 'ASH', 'COAL', 'MANTEL', 'WARMTH'] },
    { name: 'Lyric', theme: 'Poetry', accent: ACCENTS[2], words: ['LYRIC', 'VERSE', 'STANZA', 'RHYME', 'METER', 'ODE', 'SONNET', 'ELEGY', 'BALLAD', 'BARD'] },
    { name: 'Spray', theme: 'Coastal mist', accent: ACCENTS[8], words: ['SPRAY', 'MIST', 'FOAM', 'SALT', 'CRASH', 'WAVE', 'SEA', 'WIND', 'SHORE', 'TIDE'] },
    { name: 'Citrus', theme: 'Sour fruits', accent: ACCENTS[3], words: ['LEMON', 'LIME', 'ORANGE', 'GRAPEFRUIT', 'MANDARIN', 'TANGERINE', 'POMMELO', 'KUMQUAT', 'ZEST', 'PEEL'] },
    { name: 'Phantom', theme: 'Ghosts', accent: ACCENTS[6], words: ['PHANTOM', 'SPECTER', 'GHOST', 'WRAITH', 'HAUNT', 'SHADE', 'BANSHEE', 'POLTERGEIST', 'APPARITION', 'MOAN'] },
  ],
  // Set 18
  [
    { name: 'Pinnacle', theme: 'Mountain peaks', accent: ACCENTS[4], words: ['PINNACLE', 'SUMMIT', 'RIDGE', 'GLACIER', 'CREVASSE', 'CAIRN', 'BASECAMP', 'TRaverse', 'COULOIR', 'ARETE'] },
    { name: 'Espresso', theme: 'Coffee bar', accent: ACCENTS[1], words: ['ESPRESSO', 'RISTRETTO', 'LATTE', 'CAPPUCCINO', 'MACCHIATO', 'FLATWHITE', 'CREMA', 'PORTAFILTER', 'TAMP', 'GRIND'] },
    { name: 'Sapphire', theme: 'Blue gems', accent: ACCENTS[4], words: ['SAPPHIRE', 'RUBY', 'EMERALD', 'DIAMOND', 'OPAL', 'TOPAZ', 'AQUAMARINE', 'TANZANITE', 'CABOCHON', 'FACET'] },
    { name: 'Veld', theme: 'African bush', accent: ACCENTS[3], words: ['VELD', 'KOPJE', 'ACACIA', 'WILDEBEEST', 'ZEBRA', 'GAZELLE', 'CHEETAH', 'MEERKAT', 'BAOBAB', 'AARDVARK'] },
    { name: 'Anvil', theme: 'Blacksmith', accent: ACCENTS[0], words: ['ANVIL', 'HAMMER', 'TONGS', 'FORGE', 'BELLOWS', 'QUENCH', 'TEMPER', 'SLAG', 'SPARK', 'PUNCH'] },
    { name: 'Zodiac', theme: 'Star signs', accent: ACCENTS[7], words: ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN'] },
  ],
  // Set 19
  [
    { name: 'Tidal', theme: 'Rising seas', accent: ACCENTS[5], words: ['TIDAL', 'SURGE', 'MOON', 'GRAVITY', 'BAY', 'ESTUARY', 'FLOOD', 'EBB', 'FLOW', 'SPRINGTIDE'] },
    { name: 'Brig', theme: 'Sailing ships', accent: ACCENTS[9], words: ['BRIG', 'MAST', 'YARD', 'SAIL', 'RIGGING', 'HELM', 'GALLEY', 'HOLD', 'CAPSTAN', 'BOWSPRIT'] },
    { name: 'Lichen', theme: 'Forest floors', accent: ACCENTS[3], words: ['LICHEN', 'MOSS', 'FERN', 'FUNGI', 'TOADSTOOL', 'SPORE', 'DECAY', 'HUMUS', 'ROOT', 'SHADE'] },
    { name: 'Spur', theme: 'Cowboy gear', accent: ACCENTS[1], words: ['SPUR', 'BOOT', 'HAT', 'LASSO', 'BRAND', 'RANCH', 'CATTLE', 'RODEO', 'CHAPS', 'STIRRUP'] },
    { name: 'Velvet', theme: 'Royal cloth', accent: ACCENTS[7], words: ['VELVET', 'SILK', 'SATIN', 'BROCADE', 'LACE', 'EMBROIDERY', 'DAMASK', 'TAFFETA', 'GOLDTHREAD', 'MANTLE'] },
    { name: 'Nimbus', theme: 'Cloud types', accent: ACCENTS[4], words: ['NIMBUS', 'CUMULUS', 'CIRRUS', 'STRATUS', 'CUMULONIMBUS', 'ALTOSTRATUS', 'FRACTUS', 'LENTICULAR', 'MAMMATUS', 'ANVIL'] },
  ],
  // Set 20
  [
    { name: 'Marble', theme: 'Sculpture', accent: ACCENTS[9], words: ['MARBLE', 'CHISEL', 'STATUE', 'BUST', 'DRAPERY', 'PEDESTAL', 'QUARRY', 'POLISH', 'FRESCO', 'RELIEF'] },
    { name: 'Talon', theme: 'Eagles', accent: ACCENTS[0], words: ['TALON', 'BEAK', 'PLUMAGE', 'NEST', 'AERIE', 'THERMAL', 'SOAR', 'DIVE', 'WINGSPAN', 'RAPTOR'] },
    { name: 'Indigo', theme: 'Deep blues', accent: ACCENTS[4], words: ['INDIGO', 'COBALT', 'AZURE', 'NAVY', 'TEAL', 'CERULEAN', 'SAPPHIRE', 'ULTRAMARINE', 'PRUSSIAN', 'PERIWINKLE'] },
    { name: 'Paddock', theme: 'Horse farm', accent: ACCENTS[3], words: ['PADDOCK', 'FENCE', 'GATE', 'HAY', 'TROUGH', 'BARN', 'MARE', 'FOAL', 'STALLION', 'BRIDLE'] },
    { name: 'Kelp', theme: 'Seaweed forests', accent: ACCENTS[5], words: ['KELP', 'FROND', 'HOLDFAST', 'STIPE', 'BLADDER', 'OTTER', 'URCHIN', 'ABALONE', 'ROCKFISH', 'CANOPY'] },
    { name: 'Obsidian', theme: 'Volcanic glass', accent: ACCENTS[6], words: ['OBSIDIAN', 'LAVA', 'MAGMA', 'PUMICE', 'BASALT', 'RHYOLITE', 'SCORIA', 'TUFF', 'VESICLE', 'FLOW'] },
  ],
  // Set 21
  [
    { name: 'Sumac', theme: 'Wild spices', accent: ACCENTS[1], words: ['SUMAC', 'ZATAR', 'MINT', 'DILL', 'CUMIN', 'CORIANDER', 'FENNEL', 'TURMERIC', 'PAPRIKA', 'SAFFRON'] },
    { name: 'Creek', theme: 'Small streams', accent: ACCENTS[5], words: ['CREEK', 'BROOK', 'RILL', 'MEANDER', 'POOL', 'RIPPLE', 'PEBBLE', 'TROUT', 'CATTAIL', 'REED'] },
    { name: 'Obelisk', theme: 'Tall monuments', accent: ACCENTS[9], words: ['OBELISK', 'NEEDLE', 'HIEROGLYPH', 'GRANITE', 'PLINTH', 'PHARAOH', 'SPHINX', 'TEMPLE', 'PYLON', 'COURTYARD'] },
    { name: 'Sycamore', theme: 'Big trees', accent: ACCENTS[3], words: ['SYCAMORE', 'OAK', 'ELM', 'MAPLE', 'BIRCH', 'WILLOW', 'POPLAR', 'BEECH', 'CHESTNUT', 'ASPEN'] },
    { name: 'Cobalt', theme: 'Minerals', accent: ACCENTS[4], words: ['COBALT', 'COPPER', 'ZINC', 'NICKEL', 'IRON', 'MANGANESE', 'GALENA', 'PYRITE', 'MALACHITE', 'AZURITE'] },
    { name: 'Pelican', theme: 'Shorebirds', accent: ACCENTS[8], words: ['PELICAN', 'GULL', 'TERN', 'HERON', 'EGRET', 'AVOCET', 'STILT', 'SANDPIPER', 'PLOVER', 'OYSTERCATCHER'] },
  ],
  // Set 22
  [
    { name: 'Savanna', theme: 'Grassland', accent: ACCENTS[1], words: ['SAVANNA', 'GRASS', 'ACACIA', 'ZEBRA', 'LION', 'GAZELLE', 'ELEPHANT', 'CHEETAH', 'OSTRICH', 'WILDEBEEST'] },
    { name: 'Obsidian', theme: 'Dark glass', accent: ACCENTS[0], words: ['OBSIDIAN', 'FLAKE', 'KNAPPING', 'BLADE', 'SCRAPER', 'ARROWHEAD', 'SPEAR', 'CORE', 'BI FACE', 'ARTIFACT'] },
    { name: 'Dolphin', theme: 'Marine mammals', accent: ACCENTS[5], words: ['DOLPHIN', 'PORPOISE', 'WHALE', 'ORCA', 'NARWHAL', 'MANATEE', 'SEAL', 'OTTER', 'WALRUS', 'DUGONG'] },
    { name: 'Tarragon', theme: 'Fine herbs', accent: ACCENTS[3], words: ['TARRAGON', 'CHERVIL', 'CHIVE', 'MARJORAM', 'TARRA', 'LOVAGE', 'BORAGE', 'SORREL', 'BURNET', 'ANGELICA'] },
    { name: 'Helm', theme: 'Steering', accent: ACCENTS[9], words: ['HELM', 'WHEEL', 'TILLER', 'RUDDER', 'COMPASS', 'BEARING', 'STARBOARD', 'PORT', 'KEEL', 'WAKE'] },
    { name: 'Sonar', theme: 'Sound waves', accent: ACCENTS[6], words: ['SONAR', 'PING', 'ECHO', 'HYDROPHONE', 'DEPTH', 'SUBMARINE', 'PINGER', 'TRANSDUCER', 'BATHYMETRY', 'SUBSEA'] },
  ],
  // Set 23
  [
    { name: 'Quasar', theme: 'Bright cores', accent: ACCENTS[6], words: ['QUASAR', 'ACCRETION', 'BLACKHOLE', 'JET', 'REDSHIFT', 'BLAZAR', 'GALAXY', 'LUMINOSITY', 'SPECTRUM', 'PARSEC'] },
    { name: 'Mariner', theme: 'Sailors', accent: ACCENTS[4], words: ['MARINER', 'BOATSWAIN', 'HELM', 'MIZZEN', 'FORESAIL', 'BOWLINE', 'CROWNEST', 'GALLEY', 'QUARTERDECK', 'CAPSTAN'] },
    { name: 'Iris', theme: 'Eye and flower', accent: ACCENTS[7], words: ['IRIS', 'PUPIL', 'CORNEA', 'RETINA', 'LENS', 'PETAL', 'BLOOM', 'STIGMA', 'SEPAL', 'RHIZOME'] },
    { name: 'Knot', theme: 'Rope work', accent: ACCENTS[1], words: ['KNOT', 'BEND', 'HITCH', 'BIGHT', 'LOOP', 'SPLICE', 'WHIP', 'SEIZING', 'BOWLINE', 'CLOVEHITCH'] },
    { name: 'Grotto', theme: 'Sea caves', accent: ACCENTS[5], words: ['GROTTO', 'CAVERN', 'STALACTITE', 'STALAGMITE', 'COLUMN', 'FLOWSTONE', 'POOL', 'DRIPLINE', 'LIMESTONE', 'SUMP'] },
    { name: 'Pylon', theme: 'Towers', accent: ACCENTS[0], words: ['PYLON', 'GIRDER', 'RIVET', 'CABLE', 'STRUT', 'TRUSS', 'ANCHOR', 'TOWER', 'CATWALK', 'INSULATOR'] },
  ],
  // Set 24
  [
    { name: 'Cinder', theme: 'Embers', accent: ACCENTS[0], words: ['CINDER', 'EMBER', 'ASH', 'SOOT', 'CHAR', 'FLAME', 'SPARK', 'SMOLDER', 'KINDLING', 'HEARTH'] },
    { name: 'Olive', theme: 'Mediterranean', accent: ACCENTS[3], words: ['OLIVE', 'GROVE', 'OIL', 'PRESS', 'BRINE', 'CURE', 'LEAF', 'BRANCH', 'MEDITERRANEAN', 'HARVEST'] },
    { name: 'Meridian', theme: 'Lines of longitude', accent: ACCENTS[4], words: ['MERIDIAN', 'PRIME', 'LONGITUDE', 'LATITUDE', 'EQUATOR', 'TROPIC', 'POLE', 'GRID', 'TIMEZONE', 'DEGREE'] },
    { name: 'Tundra', theme: 'Cold life', accent: ACCENTS[5], words: ['TUNDRA', 'CARIBOU', 'MUSKOX', 'LEMming', 'WOLF', 'ARCTICFOX', 'PTARMIGAN', 'LICHEN', 'WILLOW', 'PERMAFROST'] },
    { name: 'Damask', theme: 'Woven patterns', accent: ACCENTS[7], words: ['DAMASK', 'BROCADE', 'JACQUARD', 'LOOM', 'SHUTTLE', 'WEFT', 'WARP', 'PATTERN', 'SILK', 'BROCATEL'] },
    { name: 'Sextant', theme: 'Old navigation', accent: ACCENTS[9], words: ['SEXTANT', 'ASTROLABE', 'COMPASS', 'CHRONOMETER', 'BEARING', 'LATITUDE', 'LONGITUDE', 'HORIZON', 'STAR', 'NAUTICAL'] },
  ],
  // Set 25
  [
    { name: 'Asteroid', theme: 'Space rocks', accent: ACCENTS[6], words: ['ASTEROID', 'METEOR', 'METEORITE', 'BOLIDE', 'CRATER', 'BELT', 'CERES', 'VESTA', 'PALLAS', 'HYGEIA'] },
    { name: 'Thyme', theme: 'Kitchen herbs', accent: ACCENTS[3], words: ['THYME', 'BASIL', 'SAGE', 'ROSEMARY', 'MINT', 'OREGANO', 'MARJORAM', 'TARRAGON', 'DILL', 'BAYLEAF'] },
    { name: 'Halyard', theme: 'Sail ropes', accent: ACCENTS[4], words: ['HALYARD', 'SHEET', 'CLEW', 'BOLTROPE', 'BIGHT', 'PARREL', 'SHROUD', 'STAY', 'FOOTROPE', 'TACK'] },
    { name: 'Vellum', theme: 'Old parchment', accent: ACCENTS[9], words: ['VELLUM', 'PARCHMENT', 'SCROLL', 'CODEX', 'FOLIO', 'QUIRE', 'RUBRIC', 'MINIATURE', 'GILDED', 'SCRIPTORIUM'] },
    { name: 'Geyser', theme: 'Hot springs', accent: ACCENTS[1], words: ['GEYSER', 'FUMAROLE', 'HOTSPRING', 'STEAM', 'BASIN', 'SINTER', 'GEOTHERMAL', 'CALDERA', 'MUDPOT', 'ERUPTION'] },
    { name: 'Peridot', theme: 'Green gems', accent: ACCENTS[3], words: ['PERIDOT', 'OLIVINE', 'EMERALD', 'JADE', 'MALACHITE', 'CHRYSOPRASE', 'AVENTURINE', 'BLOODSTONE', 'SERPENTINE', 'DEMANTOID'] },
  ],
  // Set 26
  [
    { name: 'Maple', theme: 'Autumn trees', accent: ACCENTS[1], words: ['MAPLE', 'OAK', 'BIRCH', 'ASPEN', 'CHESTNUT', 'HICKORY', 'WALNUT', 'SYCAMORE', 'POPLAR', 'ELM'] },
    { name: 'Trident', theme: 'Sea mythology', accent: ACCENTS[5], words: ['TRIDENT', 'POSEIDON', 'KRAKEN', 'SIREN', 'SCYLLA', 'CHARYBDIS', 'OCEANUS', 'NEREID', 'HIPPOCAMP', 'CONCH'] },
    { name: 'Cobalt', theme: 'Deep blue', accent: ACCENTS[4], words: ['COBALT', 'AZURE', 'CERULEAN', 'ULTRAMARINE', 'PRUSSIAN', 'NAVY', 'INDIGO', 'TEAL', 'PERIWINKLE', 'COBALTBLUE'] },
    { name: 'Glider', theme: 'Silent flight', accent: ACCENTS[3], words: ['GLIDER', 'THERMAL', 'UPDRAFT', 'CANOPY', 'ALTITUDE', 'VARIO', 'SOAR', 'CROSSCOUNTRY', 'RIDGELIFT', 'WAVE'] },
    { name: 'Anise', theme: 'Spice seeds', accent: ACCENTS[2], words: ['ANISE', 'FENNEL', 'CARAWAY', 'CORIANDER', 'CUMIN', 'DILL', 'CELERY', 'MUSTARD', 'POPPY', 'SESAME'] },
    { name: 'Ravine', theme: 'Deep cuts', accent: ACCENTS[7], words: ['RAVINE', 'GORGE', 'CANYON', 'CHASM', 'CREVICE', 'GULCH', 'DRAW', 'WADI', 'FLUME', 'SLOT'] },
  ],
  // Set 27
  [
    { name: 'Pulsar', theme: 'Spinning stars', accent: ACCENTS[6], words: ['PULSAR', 'NEUTRON', 'MAGNETAR', 'BEAM', 'ROTATION', 'PERIOD', 'GLITCH', 'CRAB', 'VITERBI', 'MILLISECOND'] },
    { name: 'Cinnamon', theme: 'Warm spice', accent: ACCENTS[1], words: ['CINNAMON', 'CASSIA', 'BARK', 'STICK', 'POWDER', 'QUILL', 'SPICE', 'MULL', 'CHAI', 'GROG'] },
    { name: 'Penguin', theme: 'Antarctic birds', accent: ACCENTS[5], words: ['PENGUIN', 'EMPEROR', 'ADELIE', 'GENTOO', 'CHINSTRAP', 'ROCKHOPPER', 'MACARONI', 'KING', 'TUXEDO', 'ROOKERY'] },
    { name: 'Kintsugi', theme: 'Golden repair', accent: ACCENTS[9], words: ['KINTSUGI', 'GOLD', 'CRACK', 'MEND', 'LACQUER', 'JOIN', 'FRACTURE', 'BEAUTY', 'WABI', 'SAVI'] },
    { name: 'Badger', theme: 'Woodland diggers', accent: ACCENTS[0], words: ['BADGER', 'SETT', 'BURROW', 'DIG', 'CLAW', 'STRIPE', 'OMNIVORE', 'HONEY', 'EARTHWORM', 'NOCTURNAL'] },
    { name: 'Fable', theme: 'Moral tales', accent: ACCENTS[2], words: ['FABLE', 'AESOP', 'MORAL', 'FOX', 'GRAPES', 'TORTOISE', 'HARE', 'CROW', 'PITCHER', 'ANT'] },
  ],
  // Set 28
  [
    { name: 'Lyra', theme: 'Constellation', accent: ACCENTS[6], words: ['LYRA', 'VEGA', 'STELLAR', 'NEBULA', 'RINGNEBULA', 'CONSTELLATION', 'HARP', 'ORPHEUS', 'METEOR', 'ZENITH'] },
    { name: 'Saffron', theme: 'Red gold', accent: ACCENTS[0], words: ['SAFFRON', 'CROCUS', 'STIGMA', 'PISTIL', 'THREAD', 'HARVEST', 'PAELLA', 'RISOTTO', 'BOUILLON', 'BASMATI'] },
    { name: 'Walnut', theme: 'Nuts and shells', accent: ACCENTS[3], words: ['WALNUT', 'PECAN', 'ALMOND', 'HAZELNUT', 'PISTACHIO', 'CASHEW', 'MACADAMIA', 'BRAZIL', 'ACORN', 'CHESTNUT'] },
    { name: 'Curtain', theme: 'Theatre stage', accent: ACCENTS[8], words: ['CURTAIN', 'STAGE', 'PROSCENIUM', 'ACT', 'MONOLOGUE', 'SOLILOQUY', 'PROP', 'ENCORE', 'BOW', 'SPOTLIGHT'] },
    { name: 'Granite', theme: 'Hard rock', accent: ACCENTS[9], words: ['GRANITE', 'QUARTZ', 'FELDSPAR', 'MICA', 'BATHOLITH', 'PEGMATITE', 'INTRUSIVE', 'MAFIC', 'FELSIC', 'PLUTON'] },
    { name: 'Gazelle', theme: 'Graceful runners', accent: ACCENTS[1], words: ['GAZELLE', 'SPRINGBOK', 'IMPALA', 'DIKDIK', 'DORCAS', 'GRANT', 'THOMSON', 'SPEED', 'SAVANNA', 'LEAP'] },
  ],
  // Set 29
  [
    { name: 'Mirage', theme: 'Desert illusion', accent: ACCENTS[1], words: ['MIRAGE', 'HEAT', 'REFRACTION', 'SHIMMER', 'DISTANCE', 'ILLUSION', 'SAND', 'DUNE', 'OASIS', 'WAVES'] },
    { name: 'Parchment', theme: 'Old maps', accent: ACCENTS[9], words: ['PARCHMENT', 'SCROLL', 'CHART', 'COMPASSROSE', 'LATITUDE', 'LONGITUDE', 'TERRA', 'HEREBEDRAGONS', 'INK', 'CALLIGRAPHY'] },
    { name: 'Avocado', theme: 'Green fruit', accent: ACCENTS[3], words: ['AVOCADO', 'GUACAMOLE', 'HASS', 'FUERTE', 'PIT', 'FLESH', 'SHELL', 'FAT', 'OLEIC', 'CALIFORNIA'] },
    { name: 'Acropolis', theme: 'High city', accent: ACCENTS[4], words: ['ACROPOLIS', 'PARTHENON', 'COLUMN', 'DORIC', 'IONIC', 'CORINTHIAN', 'FRIEZE', 'PEDIMENT', 'NAOS', 'PROPYLAEA'] },
    { name: 'Cherry', theme: 'Stone fruit', accent: ACCENTS[0], words: ['CHERRY', 'BLOSSOM', 'BING', 'RAINIER', 'PIE', 'STONE', 'STEM', 'ORCHARD', 'MARASCHINO', 'YOSHINO'] },
    { name: 'Sonar', theme: 'Echo location', accent: ACCENTS[6], words: ['SONAR', 'PING', 'ECHO', 'HYDROPHONE', 'TRANSDUCER', 'BATHYMETRY', 'SUBMARINE', 'DEPTH', 'FATHOM', 'PINGER'] },
  ],
  // Set 30
  [
    { name: 'Equinox', theme: 'Equal night', accent: ACCENTS[4], words: ['EQUINOX', 'SOLSTICE', 'AXIAL', 'TILT', 'SPRING', 'AUTUMN', 'DAYLIGHT', 'SUN', 'ZODIAC', 'PRECESSION'] },
    { name: 'Fudge', theme: 'Sweet treat', accent: ACCENTS[9], words: ['FUDGE', 'CHOCOLATE', 'CARAMEL', 'BUTTER', 'SUGAR', 'CREAM', 'PENUCHE', 'DIVINITY', 'PRALINE', 'MARSHMALLOW'] },
    { name: 'Caribou', theme: 'Northern herds', accent: ACCENTS[5], words: ['CARIBOU', 'TUNDRA', 'MIGRATION', 'ANTLER', 'LICHEN', 'REINDEER', 'ARCTIC', 'HOOF', 'HERD', 'CALVING'] },
    { name: 'Knot', theme: 'Tie and bind', accent: ACCENTS[1], words: ['KNOT', 'BOWLINE', 'CLOVEHITCH', 'SQUAREKNOT', 'SHEETBEND', 'FIGUREEIGHT', 'HITCH', 'BEND', 'SPLICE', 'WHIPPING'] },
    { name: 'Manta', theme: 'Gentle giants', accent: ACCENTS[7], words: ['MANTA', 'RAY', 'PLANKTON', 'FILTER', 'WINGSPAN', 'CEPHALIC', 'HORN', 'SPOTTED', 'GENTLE', 'PELAGIC'] },
    { name: 'Lyric', theme: 'Song words', accent: ACCENTS[2], words: ['LYRIC', 'VERSE', 'CHORUS', 'BRIDGE', 'REFRAIN', 'MELODY', 'RHYME', 'CADENCE', 'STANZA', 'HARMONY'] },
  ],
  // Set 31
  [
    { name: 'Cosmos', theme: 'Everything', accent: ACCENTS[6], words: ['COSMOS', 'UNIVERSE', 'GALAXY', 'NEBULA', 'STAR', 'PLANET', 'ASTEROID', 'COMET', 'BLACKHOLE', 'DARKMATTER'] },
    { name: 'Porcelain', theme: 'Fine ceramic', accent: ACCENTS[8], words: ['PORCELAIN', 'KAOLIN', 'GLAZE', 'KILN', 'BISQUE', 'CELADON', 'BLUEANDWHITE', 'MING', 'JINGDEZHEN', 'BONE'] },
    { name: 'Beaver', theme: 'Dam builders', accent: ACCENTS[3], words: ['BEAVER', 'DAM', 'LODGE', 'POND', 'GNAW', 'TAIL', 'INCISOR', 'FUR', 'COLONY', 'ENGINEER'] },
    { name: 'Cider', theme: 'Orchard drink', accent: ACCENTS[1], words: ['CIDER', 'APPLE', 'PRESS', 'FERMENT', 'POMACE', 'ORCHARD', 'HARVEST', 'MULL', 'SPICE', 'PERRY'] },
    { name: 'Atlas', theme: 'World maps', accent: ACCENTS[4], words: ['ATLAS', 'MAP', 'GLOBE', 'TERRAIN', 'BORDER', 'CAPITAL', 'RIVER', 'MOUNTAIN', 'DESERT', 'OCEAN'] },
    { name: 'Quartz', theme: 'Crystal clock', accent: ACCENTS[6], words: ['QUARTZ', 'PIEZO', 'OSCILLATOR', 'FREQUENCY', 'CRYSTAL', 'TUNINGFORK', 'HEART', 'BATTERY', 'CIRCUIT', 'RESONATOR'] },
  ],
  // Set 32
  [
    { name: 'Coral', theme: 'Living reef', accent: ACCENTS[5], words: ['CORAL', 'POLYP', 'REEF', 'ATOLL', 'BLEACH', 'SPAWN', 'SYMBIONT', 'CALCIUM', 'FRINGE', 'BARRIER'] },
    { name: 'Velvet', theme: 'Soft pile', accent: ACCENTS[7], words: ['VELVET', 'PILE', 'WARP', 'SILK', 'COTTON', 'SYNTHETIC', 'CRUSHED', 'PANNE', 'DEVORE', 'PLAIN'] },
    { name: 'Lynx', theme: 'Wild cats', accent: ACCENTS[0], words: ['LYNX', 'BOBCAT', 'CARACAL', 'SERVAL', 'OCELOT', 'MARGAY', 'PUMA', 'JAGUAR', 'TUFFTEAR', 'RUFF'] },
    { name: 'Sake', theme: 'Rice wine', accent: ACCENTS[2], words: ['SAKE', 'RICE', 'KOJI', 'YEAST', 'MOROMI', 'FERMENT', 'JUNMAI', 'GINJO', 'DAIGINJO', 'NIGORI'] },
    { name: 'Basalt', theme: 'Volcanic rock', accent: ACCENTS[9], words: ['BASALT', 'LAVA', 'MAGMA', 'PUMICE', 'OBSIDIAN', 'RHYOLITE', 'ANDESITE', 'SCORIA', 'TUFF', 'VESICLE'] },
    { name: 'Anvil', theme: 'Heavy iron', accent: ACCENTS[0], words: ['ANVIL', 'HAMMER', 'TONGS', 'FORGE', 'BELLOWS', 'QUENCH', 'TEMPER', 'SLAG', 'SPARK', 'PUNCH'] },
  ],
  // Set 33
  [
    { name: 'Orion', theme: 'Hunter in sky', accent: ACCENTS[6], words: ['ORION', 'BETELGEUSE', 'RIGEL', 'BELLATRIX', 'SAIPH', 'NEBULA', 'HORSEHEAD', 'MINTAKA', 'ALNILAM', 'ALNITAK'] },
    { name: 'Tarragon', theme: 'French herb', accent: ACCENTS[3], words: ['TARRAGON', 'ESTRAGON', 'ARTEMISIA', 'DRAGON', 'VINEGAR', 'BERNAISE', 'FRENCH', 'RUSSIAN', 'MUGWORT', 'WORMWOOD'] },
    { name: 'Condor', theme: 'Sky king', accent: ACCENTS[9], words: ['CONDOR', 'ANDES', 'WINGSPAN', 'SCAVENGER', 'CARRION', 'VULTURE', 'SOAR', 'THERMAL', 'CLIFF', 'NEST'] },
    { name: 'Igloo', theme: 'Snow house', accent: ACCENTS[5], words: ['IGLOO', 'SNOW', 'BLOCK', 'CUT', 'INSULATE', 'DOME', 'ENTRANCE', 'TUNNEL', 'INUIT', 'BLANKET'] },
    { name: 'Brass', theme: 'Metal alloy', accent: ACCENTS[1], words: ['BRASS', 'COPPER', 'ZINC', 'ALLOY', 'PATINA', 'LACQUER', 'TARNISH', 'MALLEABLE', 'CORROSION', 'PIECE'] },
    { name: 'Petal', theme: 'Flower leaves', accent: ACCENTS[7], words: ['PETAL', 'STAMEN', 'PISTIL', 'STIGMA', 'SEPAL', 'NECTAR', 'POLLEN', 'BLOOM', 'COROLLA', 'CALYX'] },
  ],
  // Set 34
  [
    { name: 'Comet', theme: 'Icy tail', accent: ACCENTS[5], words: ['COMET', 'NUCLEUS', 'COMA', 'TAIL', 'ION', 'DUST', 'ORBIT', 'PERIHELION', 'OORTCLOUD', 'METEOR'] },
    { name: 'Umami', theme: 'Fifth taste', accent: ACCENTS[1], words: ['UMAMI', 'GLUTAMATE', 'MSG', 'SAVORY', 'KOMBU', 'DASHI', 'TOMATO', 'MUSHROOM', 'AGED', 'FERMENTED'] },
    { name: 'Garnet', theme: 'Deep red gem', accent: ACCENTS[0], words: ['GARNET', 'ALMANDINE', 'PYROPE', 'SPESSARTINE', 'GROSSULAR', 'UVAROVITE', 'DEEPRED', 'CABOCHON', 'FACET', 'CARAT'] },
    { name: 'Reindeer', theme: 'Winter traveler', accent: ACCENTS[5], words: ['REINDEER', 'CARIBOU', 'ANTLER', 'TUNDRA', 'LICHEN', 'SLEIGH', 'SANTA', 'NOSE', 'HOOF', 'HERD'] },
    { name: 'Violin', theme: 'Bowed strings', accent: ACCENTS[2], words: ['VIOLIN', 'BOW', 'ROSIN', 'BRIDGE', 'PEG', 'FINGERBOARD', 'CHINREST', 'FHOLE', 'VIBRATO', 'PIZZICATO'] },
    { name: 'Pixel', theme: 'Screen dots', accent: ACCENTS[6], words: ['PIXEL', 'RESOLUTION', 'BITMAP', 'RGB', 'RASTER', 'VECTOR', 'SPRITE', 'ALIASING', 'DITHER', 'GAMMA'] },
  ],
  // Set 35
  [
    { name: 'Tundra', theme: 'Treeless cold', accent: ACCENTS[5], words: ['TUNDRA', 'PERMAFROST', 'LICHEN', 'MOSS', 'WILLOW', 'LEMMING', 'ARCTICFOX', 'MUSKOX', 'CARIBOU', 'PTARMIGAN'] },
    { name: 'Lantern', theme: 'Guiding light', accent: ACCENTS[1], words: ['LANTERN', 'BEACON', 'OIL', 'WICK', 'FLAME', 'GLASS', 'CAGE', 'HOOK', 'POST', 'LUMINOUS'] },
    { name: 'Octopus', theme: 'Eight arms', accent: ACCENTS[7], words: ['OCTOPUS', 'TENTACLE', 'INK', 'MANTLE', 'BEAK', 'SIPHON', 'CAMOUFLAGE', 'SUCKER', 'CILIATED', 'CHROMATOPHORE'] },
    { name: 'Cumin', theme: 'Earthy spice', accent: ACCENTS[1], words: ['CUMIN', 'CORIANDER', 'TURMERIC', 'GARAM', 'CURRY', 'POWDER', 'SEED', 'ROASTED', 'GROUND', 'BLENDED'] },
    { name: 'Dolphins', theme: 'Cetacean pods', accent: ACCENTS[5], words: ['DOLPHIN', 'POD', 'ECHOLOCATION', 'BOTTLENOSE', 'SPINNER', 'ORCA', 'FLIPPER', 'BLOWHOLE', 'DORSAL', 'PELAGIC'] },
    { name: 'Forge', theme: 'Hammer and fire', accent: ACCENTS[0], words: ['FORGE', 'ANVIL', 'HAMMER', 'TONGS', 'BELLOWS', 'QUENCH', 'TEMPER', 'STEEL', 'IRON', 'SPARK'] },
  ],
  // Set 36
  [
    { name: 'Glacier', theme: 'River of ice', accent: ACCENTS[5], words: ['GLACIER', 'ICE', 'CREVASSE', 'SERAC', 'MORAIN', 'ICEFALL', 'AVALANCHE', 'FJORD', 'CIRQUE', 'SNOWLINE'] },
    { name: 'Saffron', theme: 'Crocus gold', accent: ACCENTS[0], words: ['SAFFRON', 'CROCUS', 'STIGMA', 'PISTIL', 'THREAD', 'SPICE', 'HARVEST', 'KASHMIR', 'SPANISH', 'PERSIAN'] },
    { name: 'Badger', theme: 'Black and white', accent: ACCENTS[0], words: ['BADGER', 'SETT', 'BURROW', 'DIG', 'CLAW', 'STRIPE', 'FERRET', 'WEASEL', 'OTTER', 'MARTEN'] },
    { name: 'Cobra', theme: 'Hooded serpent', accent: ACCENTS[3], words: ['COBRA', 'KING', 'HOOD', 'VENOM', 'FANG', 'SERPENT', 'SPIT', 'HISS', 'SLITHER', 'Mongoose'.toUpperCase()] },
    { name: 'Marigold', theme: 'Orange bloom', accent: ACCENTS[1], words: ['MARIGOLD', 'TAGETES', 'BLOOM', 'PETAL', 'ORANGE', 'YELLOW', 'GARLAND', 'DIWALI', 'CALENDULA', 'FESTIVAL'] },
    { name: 'Pyramid', theme: 'Ancient tomb', accent: ACCENTS[1], words: ['PYRAMID', 'PHARAOH', 'GIZA', 'SPHINX', 'MUMMY', 'SARCOPHAGUS', 'HIEROGLYPH', 'OBELISK', 'TEMPLE', 'NILE'] },
  ],
  // Set 37
  [
    { name: 'Nebula', theme: 'Star cloud', accent: ACCENTS[7], words: ['NEBULA', 'ORION', 'HELIX', 'CRAB', 'EAGLE', 'CATSEYE', 'PELIAN', 'LAGOON', 'DUMBBELL', 'ROSETTE'] },
    { name: 'Cloves', theme: 'Dried buds', accent: ACCENTS[3], words: ['CLOVE', 'BUD', 'SPICE', 'EUGENOL', 'OIL', 'GARNISH', 'MULL', 'HAM', 'STUD', 'POMANDER'] },
    { name: 'Narwhal', theme: 'Arctic unicorn', accent: ACCENTS[5], words: ['NARWHAL', 'TUSK', 'IVORY', 'ARCTIC', 'ICE', 'POD', 'BALEEN', 'BREACH', 'BAY', 'CURRENT'] },
    { name: 'Piston', theme: 'Engine part', accent: ACCENTS[0], words: ['PISTON', 'CYLINDER', 'CRANK', 'VALVE', 'RING', 'CONNECTINGROD', 'COMBUSTION', 'STROKE', 'BORE', 'CAM'] },
    { name: 'Glade', theme: 'Sunlit clearing', accent: ACCENTS[3], words: ['GLADE', 'OAK', 'STREAM', 'MOSS', 'FERN', 'ROBIN', 'BIRCH', 'STOAT', 'TOADSTOOL', 'BREEZE'] },
    { name: 'Kelp', theme: 'Underwater forest', accent: ACCENTS[3], words: ['KELP', 'FROND', 'HOLDFAST', 'STIPE', 'BLADDER', 'OTTER', 'URCHIN', 'ABALONE', 'ROCKFISH', 'CANOPY'] },
  ],
  // Set 38
  [
    { name: 'Quasar', theme: 'Distant beacon', accent: ACCENTS[6], words: ['QUASAR', 'ACCRETION', 'BLACKHOLE', 'JET', 'REDSHIFT', 'BLAZAR', 'GALAXY', 'LUMINOSITY', 'SPECTRUM', 'PARSEC'] },
    { name: 'Vanilla', theme: 'Orchid bean', accent: ACCENTS[9], words: ['VANILLA', 'ORCHID', 'BEAN', 'POD', 'EXTRACT', 'MADAGASCAR', 'TAHITI', 'BOURBON', 'ICECREAM', 'CUSTARD'] },
    { name: 'Platypus', theme: 'Odd mammal', accent: ACCENTS[3], words: ['PLATYPUS', 'BILL', 'WEBBED', 'SPUR', 'VENOM', 'EGG', 'MONOTREME', 'BURROW', 'STREAM', 'AUSTRALIA'] },
    { name: 'Turbine', theme: 'Spinning blades', accent: ACCENTS[4], words: ['TURBINE', 'BLADE', 'ROTATION', 'SHAFT', 'STEAM', 'GAS', 'WIND', 'GENERATOR', 'COMPRESSOR', 'NOZZLE'] },
    { name: 'Magnolia', theme: 'Southern bloom', accent: ACCENTS[7], words: ['MAGNOLIA', 'BLOSSOM', 'PETAL', 'TREE', 'SOUTHERN', 'EVERGREEN', 'DECIDUOUS', 'FRAGRANT', 'BARK', 'SEEDPOD'] },
    { name: 'Obsidian', theme: 'Glassy volcanic', accent: ACCENTS[0], words: ['OBSIDIAN', 'LAVA', 'MAGMA', 'FLAKE', 'KNAPPING', 'ARROWHEAD', 'SCRAPER', 'BLADE', 'CORE', 'ARTIFACT'] },
  ],
  // Set 39
  [
    { name: 'Supernova', theme: 'Stellar death', accent: ACCENTS[6], words: ['SUPERNOVA', 'REMNANT', 'NEUTRONSTAR', 'BLACKHOLE', 'SHOCKWAVE', 'ELEMENTS', 'CRABNEBULA', 'TYPEIA', 'TYPEII', 'PROGENITOR'] },
    { name: 'Cardamom', theme: 'Aromatic pod', accent: ACCENTS[3], words: ['CARDAMOM', 'POD', 'GREEN', 'BLACK', 'SPICE', 'CHAI', 'CURRY', 'AROMA', 'SEED', 'GRIND'] },
    { name: 'Jellyfish', theme: 'Floating gel', accent: ACCENTS[5], words: ['JELLYFISH', 'TENTACLE', 'BELL', 'NUCLEUS', 'STING', 'NEMATOCYST', 'PLANKTON', 'CURRENT', 'DRIFT', 'BLOOM'] },
    { name: 'Amber', theme: 'Fossil resin', accent: ACCENTS[1], words: ['AMBER', 'RESIN', 'FOSSIL', 'INSECT', 'BALTIC', 'DOMINICAN', 'COPAL', 'POLISH', 'BEAD', 'NECKLACE'] },
    { name: 'Birch', theme: 'White bark', accent: ACCENTS[8], words: ['BIRCH', 'BARK', 'WHITE', 'PAPER', 'SAP', 'TAPPING', 'SYRUP', 'CATKIN', 'WINTER', 'BOLE'] },
    { name: 'Pendulum', theme: 'Swinging weight', accent: ACCENTS[2], words: ['PENDULUM', 'SWING', 'BOB', 'PERIOD', 'AMPLITUDE', 'DAMPING', 'RESONANCE', 'FREQUENCY', 'GRILL', 'GRANDFATHER'] },
  ],
  // Set 40
  [
    { name: 'Andromeda', theme: 'Nearest galaxy', accent: ACCENTS[6], words: ['ANDROMEDA', 'M31', 'GALAXY', 'SPIRAL', 'MERGER', 'MILKYWAY', 'STARS', 'DARKMATTER', 'GLOBULAR', 'SUPERNOVA'] },
    { name: 'Paprika', theme: 'Red powder', accent: ACCENTS[0], words: ['PAPRIKA', 'PEPPER', 'SWEET', 'HOT', 'SMOKED', 'SPANISH', 'HUNGARIAN', 'RED', 'POWDER', 'GARNISH'] },
    { name: 'Sloth', theme: 'Slow mover', accent: ACCENTS[3], words: ['SLOTH', 'BRADYPOD', 'TWO-TOED', 'THREE-TOED', 'CANOPY', 'ALGAE', 'FUR', 'CLAW', 'HANG', 'LEAF'] },
    { name: 'Bismuth', theme: 'Rainbow metal', accent: ACCENTS[8], words: ['BISMUTH', 'CRYSTAL', 'STAIRSTEP', 'RAINBOW', 'IRIDESCENT', 'OXIDE', 'PEPTO', 'HEAVYMETAL', 'LOWMELT', 'DIAMAGNETIC'] },
    { name: 'Foxglove', theme: 'Tall spikes', accent: ACCENTS[7], words: ['FOXGLOVE', 'DIGITALIS', 'SPIKE', 'BELL', 'PURPLE', 'PINK', 'BIENNIAL', 'HEART', 'POISON', 'GARDEN'] },
    { name: 'Trebuchet', theme: 'Siege engine', accent: ACCENTS[1], words: ['TREBUCHET', 'COUNTERWEIGHT', 'SLING', 'ARM', 'PIVOT', 'PROJECTILE', 'SIEGE', 'CASTLE', 'RANGE', 'LAUNCH'] },
  ],
  // Set 41
  [
    { name: 'Pulsar', theme: 'Lighthouse beam', accent: ACCENTS[6], words: ['PULSAR', 'NEUTRONSTAR', 'BEAM', 'ROTATION', 'PERIOD', 'GLITCH', 'MILLISECOND', 'CRAB', 'DISPERSION', 'TIMING'] },
    { name: 'Mango', theme: 'Tropical stone fruit', accent: ACCENTS[1], words: ['MANGO', 'ALPHONSO', 'TOMMY', 'KEITT', 'HADEN', 'SKIN', 'FLESH', 'PIT', 'TROPICAL', 'CHUTNEY'] },
    { name: 'Arcticfox', theme: 'Snow white', accent: ACCENTS[5], words: ['ARCTICFOX', 'TUNDRA', 'LEMMING', 'PTARMIGAN', 'DEN', 'BLIZZARD', 'CAMOUFLAGE', 'WHITE', 'FUR', 'SCAVENGER'] },
    { name: 'Bellows', theme: 'Blowing air', accent: ACCENTS[0], words: ['BELLOWS', 'PLEATED', 'LEATHER', 'VALVE', 'NOZZLE', 'AIR', 'BLAST', 'FORGE', 'HANDLE', 'HINGE'] },
    { name: 'Azalea', theme: 'Spring shrub', accent: ACCENTS[7], words: ['AZALEA', 'RHODODENDRON', 'BLOSSOM', 'PINK', 'PURPLE', 'WHITE', 'SHRUB', 'SPRING', 'ACIDIC', 'MULCH'] },
    { name: 'Dhow', theme: 'Arabian sail', accent: ACCENTS[4], words: ['DHOW', 'LATEEN', 'SAIL', 'MAST', 'HULL', 'ARABIAN', 'INDIAN', 'MONSOON', 'TRADE', 'TIMBER'] },
  ],
  // Set 42
  [
    { name: 'Cassiopeia', theme: 'Queen in sky', accent: ACCENTS[7], words: ['CASSIOPEIA', 'W', 'CEDAR', 'SCHEAT', 'RUCHBAH', 'SEGIN', 'GAMMACAS', 'NEBULA', 'TYCHO', 'CONSTELLATION'] },
    { name: 'Olive', theme: 'Mediterranean tree', accent: ACCENTS[3], words: ['OLIVE', 'GROVE', 'OIL', 'PRESS', 'BRINE', 'CURE', 'LEAF', 'BRANCH', 'MEDITERRANEAN', 'KALAMATA'] },
    { name: 'Muskox', theme: 'Arctic survivor', accent: ACCENTS[9], words: ['MUSKOX', 'QIVIUT', 'WOOL', 'HORN', 'BOSS', 'TUNDRA', 'HERD', 'CIRCLE', 'ARCTIC', 'GRAZING'] },
    { name: 'Lever', theme: 'Simple machine', accent: ACCENTS[6], words: ['LEVER', 'FULCRUM', 'EFFORT', 'LOAD', 'ARM', 'PIVOT', 'CLASS', 'MECHANICAL', 'ADVANTAGE', 'RIGID'] },
    { name: 'Foxglove', theme: 'Digitalis herb', accent: ACCENTS[7], words: ['FOXGLOVE', 'DIGITALIS', 'SPIKE', 'BELL', 'PURPLE', 'BIENNIAL', 'HEART', 'POISON', 'GARDEN', 'MEDICINE'] },
    { name: 'Coracle', theme: 'Round boat', accent: ACCENTS[5], words: ['CORACLE', 'WICKER', 'HIDE', 'PADDLE', 'RIVER', 'ROUND', 'WALES', 'IRISH', 'KEELLES', 'BRETON'] },
  ],
  // Set 43
  [
    { name: 'Draco', theme: 'Dragon constellation', accent: ACCENTS[6], words: ['DRACO', 'THUBAN', 'ELTANIN', 'RASALHAGUE', 'CATSEYE', 'NEBULA', 'STAR', 'SERPENT', 'NORTHERN', 'CIRCUMPOLAR'] },
    { name: 'Nutmeg', theme: 'Warm kernel', accent: ACCENTS[1], words: ['NUTMEG', 'MACE', 'KERNEL', 'LACE', 'SPICE', 'GRATE', 'EGGNOG', 'CUSTARD', 'BAKING', 'MOLUCCA'] },
    { name: 'Serval', theme: 'Long-legged cat', accent: ACCENTS[0], words: ['SERVAL', 'SAVANNA', 'LONGLEG', 'LEAP', 'POUNCE', 'RODENT', 'BIRD', 'AFRICA', 'SPOTTED', 'NOCTURNAL'] },
    { name: 'Cordage', theme: 'Rope and line', accent: ACCENTS[4], words: ['CORDAGE', 'ROPE', 'LINE', 'TWINE', 'SPLICE', 'WHIP', 'SEIZE', 'MARLINSPIKE', 'FIBER', 'LAY'] },
    { name: 'Poppy', theme: 'Red field flower', accent: ACCENTS[0], words: ['POPPY', 'RED', 'FIELD', 'PETAL', 'CAPSULE', 'SEED', 'OPIUM', 'REMEMBRANCE', 'FLANDERS', 'PAPAYER'] },
    { name: 'Bronze', theme: 'Copper alloy', accent: ACCENTS[1], words: ['BRONZE', 'COPPER', 'TIN', 'ALLOY', 'BELL', 'STATUE', 'PATINA', 'FOUNDRY', 'CASTING', 'ALUMINUM'] },
  ],
  // Set 44
  [
    { name: 'Lyra', theme: 'Harp in sky', accent: ACCENTS[6], words: ['LYRA', 'VEGA', 'STELLAR', 'NEBULA', 'HARP', 'ORPHEUS', 'METEOR', 'ZENITH', 'RRLYRAE', 'CONSTELLATION'] },
    { name: 'Clover', theme: 'Lucky leaf', accent: ACCENTS[3], words: ['CLOVER', 'SHAMROCK', 'TRIFOLIATE', 'LEAF', 'WHITE', 'RED', 'SWEET', 'PASTURE', 'BEE', 'NITROGEN'] },
    { name: 'Macaw', theme: 'Rainbow parrot', accent: ACCENTS[7], words: ['MACAW', 'SCARLET', 'BLUE', 'GOLD', 'GREEN', 'WING', 'JUNGLE', 'CANOPY', 'BEAK', 'TALON'] },
    { name: 'Tinsmith', theme: 'Sheet metal', accent: ACCENTS[8], words: ['TINSMITH', 'SHEET', 'TIN', 'SOLDER', 'SEAM', 'PATTERN', 'CUT', 'FOLD', 'HAMMER', 'WIRE'] },
    { name: 'Violet', theme: 'Shade of purple', accent: ACCENTS[7], words: ['VIOLET', 'PURPLE', 'INDIGO', 'LAVENDER', 'LILAC', 'PLUM', 'AMETHYST', 'ORCHID', 'MAUVE', 'HEATHER'] },
    { name: 'Gastropod', theme: 'Snails and slugs', accent: ACCENTS[3], words: ['GASTROPOD', 'SNAIL', 'SLUG', 'SHELL', 'TORSION', 'RADULA', 'MANTLE', 'TENTACLE', 'FOOT', 'SPIRAL'] },
  ],
  // Set 45
  [
    { name: 'Cygnus', theme: 'The swan', accent: ACCENTS[5], words: ['CYGNUS', 'DENEB', 'ALBIREO', 'SADR', 'NEBULA', 'SWAN', 'NORTHERN', 'MILKYWAY', 'PELICAN', 'VEIL'] },
    { name: 'Mustard', theme: 'Yellow condiment', accent: ACCENTS[2], words: ['MUSTARD', 'YELLOW', 'SEED', 'DIJON', 'SPICY', 'CONDIMENT', 'BRINE', 'VINEGAR', 'POWDER', 'HONEY'] },
    { name: 'Macaque', theme: 'Old world monkey', accent: ACCENTS[0], words: ['MACAQUE', 'BARBARY', 'RHESUS', 'JAPANESE', 'TROOP', 'TAIL', 'CHEEKPOUCH', 'OMNIVORE', 'ASIA', 'GIBRALTAR'] },
    { name: 'Pulley', theme: 'Wheel and rope', accent: ACCENTS[4], words: ['PULLEY', 'WHEEL', 'ROPE', 'GROOVE', 'BLOCK', 'TACKLE', 'AXLE', 'LIFT', 'MECHANICAL', 'ADVANTAGE'] },
    { name: 'Hibiscus', theme: 'Tropical bloom', accent: ACCENTS[0], words: ['HIBISCUS', 'BLOOM', 'PETAL', 'RED', 'PINK', 'YELLOW', 'TEA', 'TROPICAL', 'STAMEN', 'COROLLA'] },
    { name: 'Carrack', theme: 'Age of sail', accent: ACCENTS[9], words: ['CARRACK', 'NAO', 'MAST', 'SAIL', 'CASTLE', 'FORE', 'AFT', 'HULL', 'CARGO', 'EXPLORATION'] },
  ],
  // Set 46
  [
    { name: 'Orion', theme: 'Winter hunter', accent: ACCENTS[6], words: ['ORION', 'BETELGEUSE', 'RIGEL', 'BELLATRIX', 'SAIPH', 'NEBULA', 'HORSEHEAD', 'BELT', 'SWORD', 'WINTER'] },
    { name: 'Thyme', theme: 'Garden herb', accent: ACCENTS[3], words: ['THYME', 'LEMON', 'CREPING', 'WILD', 'SPICE', 'BASIL', 'OREGANO', 'MARJORAM', 'SAVORY', 'MINT'] },
    { name: 'Narwhal', theme: 'Unicorn whale', accent: ACCENTS[5], words: ['NARWHAL', 'TUSK', 'IVORY', 'ARCTIC', 'ICEFLOE', 'POD', 'BALEEN', 'BREACH', 'BAY', 'CURRENT'] },
    { name: 'Catapult', theme: 'Launch device', accent: ACCENTS[0], words: ['CATAPULT', 'ARM', 'SLING', 'TORSION', 'PROJECTILE', 'SIEGE', 'CASTLE', 'RANGE', 'RELEASE', 'GRAVITY'] },
    { name: 'Lupine', theme: 'Wildflower spike', accent: ACCENTS[8], words: ['LUPINE', 'SPIKE', 'PURPLE', 'BLUE', 'PINK', 'PALMATE', 'LEAF', 'PEA', 'WILDFLOWER', 'MEADOW'] },
    { name: 'Dhow', theme: 'Arab trader', accent: ACCENTS[4], words: ['DHOW', 'LATEENSAIL', 'HULL', 'MAST', 'MONSOON', 'ARABIAN', 'INDIAN', 'TRADE', 'CARGO', 'TIMBER'] },
  ],
  // Set 47
  [
    { name: 'Phoenix', theme: 'Reborn from ash', accent: ACCENTS[0], words: ['PHOENIX', 'ASH', 'FLAME', 'REBIRTH', 'MYTH', 'FIRE', 'BIRD', 'IMMORTAL', 'CYCLE', 'SUN'] },
    { name: 'Ginger', theme: 'Spicy root', accent: ACCENTS[1], words: ['GINGER', 'ROOT', 'RHIZOME', 'SPICE', 'PUNGENT', 'STIRFRY', 'TEA', 'PICKLE', 'CRYSTALLIZED', 'ALE'] },
    { name: 'Takin', theme: 'Mountain bovid', accent: ACCENTS[3], words: ['TAKIN', 'HIMALAYA', 'MOSS', 'SALT', 'HERD', 'BAMBOO', 'MIGRATE', 'GOAT', 'ANTELOPE', 'BHUTAN'] },
    { name: 'Astrrolabe', theme: 'Star finder', accent: ACCENTS[4], words: ['ASTROLABE', 'STAR', 'ALTITUDE', 'AZIMUTH', 'RETE', 'MATER', 'PLATE', 'ALIDADE', 'SIGHT', 'GRADUATED'] },
    { name: 'Bluebell', theme: 'Woodland carpet', accent: ACCENTS[4], words: ['BLUEBELL', 'WOODLAND', 'BULB', 'SPRING', 'BLUE', 'BELL', 'CARPET', 'SEED', 'FLOWER', 'ARCHED'] },
    { name: 'Frigate', theme: 'Warship', accent: ACCENTS[9], words: ['FRIGATE', 'WARSHIP', 'GUN', 'DECK', 'SAIL', 'MAST', 'CAPTAIN', 'BROADSIDE', 'SQUADRON', 'CRUISE'] },
  ],
  // Set 48
  [
    { name: 'Vela', theme: 'Sails of ship', accent: ACCENTS[5], words: ['VELA', 'SAILS', 'CONSTELLATION', 'SOUTHERN', 'GAMMAVEL', 'PUPI', 'NEBULA', 'SUPERNOVA', 'REMNANT', 'PULSAR'] },
    { name: 'Allspice', theme: 'One berry many flavors', accent: ACCENTS[1], words: ['ALLSPICE', 'BERRY', 'PIMENTO', 'JAMAICA', 'CLOVE', 'CINNAMON', 'NUTMEG', 'PEPPER', 'LEAF', 'WOOD'] },
    { name: 'Okapi', theme: 'Forest giraffe', accent: ACCENTS[3], words: ['OKAPI', 'GIRAFFE', 'STRIPE', 'CONGO', 'RAINFOREST', 'LEAF', 'TONGUE', 'HERBIVORE', 'SHY', 'SOLITARY'] },
    { name: 'Binnacle', theme: 'Compass housing', accent: ACCENTS[9], words: ['Binnacle'.toUpperCase(), 'COMPASS', 'HOUSING', 'LAMP', 'GIMBAL', 'MAGNET', 'SHIP', 'HELM', 'BEARING', 'BRASS'] },
    { name: 'Begonia', theme: 'Shade flower', accent: ACCENTS[7], words: ['BEGONIA', 'TUBER', 'FIBROUS', 'SHADE', 'LEAF', 'BLOOM', 'PINK', 'WHITE', 'RED', 'HANGING'] },
    { name: 'Galley', theme: 'Oared ship', accent: ACCENTS[2], words: ['GALLEY', 'OAR', 'BANK', 'ROW', 'SLAVE', 'RAM', 'SAIL', 'DECK', 'CAPTAIN', 'WARSHIP'] },
  ],
  // Set 49
  [
    { name: 'Aquila', theme: 'Eagle in sky', accent: ACCENTS[0], words: ['AQUILA', 'ALTAIR', 'TARAZED', 'EAGLE', 'NEBULA', 'STELLAR', 'SUMMER', 'NORTHERN', 'GAMMA', 'CONSTELLATION'] },
    { name: 'Dill', theme: 'Feathery herb', accent: ACCENTS[3], words: ['DILL', 'WEED', 'SEED', 'PICKLE', 'FERN', 'BRINE', 'CUCUMBER', 'SOUR', 'SPICE', 'GARNISH'] },
    { name: 'Quokka', theme: 'Smiling marsupial', accent: ACCENTS[3], words: ['QUOKKA', 'SMILE', 'MARSUPIAL', 'ROTNEST', 'AUSTRALIA', 'ISLAND', 'HERBIVORE', 'NOCTURNAL', 'POUCH', 'FRIENDLY'] },
    { name: 'Sextant', theme: 'Celestial angle', accent: ACCENTS[9], words: ['SEXTANT', 'ANGLE', 'ARC', 'MIRROR', 'TELESCOPE', 'HORIZON', 'SUN', 'STAR', 'LATITUDE', 'CHRONOMETER'] },
    { name: 'Jasmine', theme: 'Night fragrance', accent: ACCENTS[8], words: ['JASMINE', 'NIGHT', 'FRAGRANCE', 'WHITE', 'YELLOW', 'VINE', 'SHRUB', 'TEA', 'PETAL', 'BLOOM'] },
    { name: 'Trireme', theme: 'Three banks of oars', accent: ACCENTS[4], words: ['TRIREME', 'OAR', 'BANK', 'THALAMITE', 'ZYGIAN', 'THRANITE', 'RAM', 'SAIL', 'GREEK', 'WARSHIP'] },
  ],
  // Set 50
  [
    { name: 'Corvus', theme: 'The crow', accent: ACCENTS[0], words: ['CORVUS', 'CROW', 'RAVEN', 'STAR', 'ALGORAB', 'KRAZ', 'GIENAH', 'MINOR', 'CRATER', 'SOUTHERN'] },
    { name: 'Tamarind', theme: 'Sour pod', accent: ACCENTS[1], words: ['TAMARIND', 'POD', 'PASTE', 'SOUR', 'CHUTNEY', 'INDIA', 'THAI', 'TROPICAL', 'SEED', 'PULP'] },
    { name: 'Gibbon', theme: 'Swinging ape', accent: ACCENTS[3], words: ['GIBBON', 'BRACHIATE', 'SWING', 'CANOPY', 'APE', 'ASIA', 'DUET', 'TERRITORY', 'FRUIT', 'NOCTURNAL'] },
    { name: 'Saddle', theme: 'Rider seat', accent: ACCENTS[9], words: ['SADDLE', 'STIRRUP', 'GIRTH', 'CANTLE', 'POMMEL', 'HORN', 'FENDER', 'SEAT', 'LEATHER', 'RIDER'] },
    { name: 'Wisteria', theme: 'Cascading vine', accent: ACCENTS[7], words: ['WISTERIA', 'VINE', 'CASCADE', 'PURPLE', 'BLUE', 'WHITE', 'BLOSSOM', 'PENDULOUS', 'FRAGRANT', 'PERGOLA'] },
    { name: 'Cog', theme: 'Medieval trader', accent: ACCENTS[6], words: ['COG', 'HULL', 'MAST', 'SAIL', 'CARGO', 'BALTIC', 'HANSEATIC', 'STEERBOARD', 'CASTLE', 'TRADER'] },
  ],
  // Set 51
  [
    { name: 'Hydra', theme: 'Water serpent', accent: ACCENTS[5], words: ['HYDRA', 'SNAKE', 'WATER', 'STAR', 'ALPHARD', 'HEAD', 'TAIL', 'SOUTHERN', 'CONSTELLATION', 'MYTH'] },
    { name: 'Cardoon', theme: 'Thistle vegetable', accent: ACCENTS[3], words: ['CARDOON', 'THISTLE', 'STALK', 'BLANCH', 'MEDITERRANEAN', 'BITTER', 'CREAMY', 'STEW', 'ITALIAN', 'ARTICHOKE'] },
    { name: 'Echidna', theme: 'Spiny anteater', accent: ACCENTS[1], words: ['ECHIDNA', 'SPINE', 'ANTEATER', 'MONOTREME', 'EGG', 'POUCH', 'AUSTRALIA', 'TONGUE', 'BURROW', 'NOCTURNAL'] },
    { name: 'Sail', theme: 'Wind catcher', accent: ACCENTS[4], words: ['SAIL', 'CANVAS', 'BOLTROPE', 'BEND', 'FOOT', 'HEAD', 'LEECH', 'LUFF', 'TACK', 'CLEW'] },
    { name: 'Daphne', theme: 'Fragrant shrub', accent: ACCENTS[7], words: ['DAPHNE', 'SHRUB', 'FRAGRANT', 'PINK', 'WHITE', 'BLOOM', 'WINTER', 'BARK', 'BERRY', 'POISON'] },
    { name: 'Barge', theme: 'Flat cargo', accent: ACCENTS[8], words: ['BARGE', 'FLAT', 'CARGO', 'TOW', 'CANAL', 'RIVER', 'HULL', 'DECK', 'PILE', 'HAUL'] },
  ],
  // Set 52
  [
    { name: 'Crux', theme: 'Southern cross', accent: ACCENTS[7], words: ['CRUX', 'CROSS', 'ACRUX', 'BECRUX', 'GACRUX', 'DECDCRUX', 'SOUTHERN', 'COALSACK', 'NEBULA', 'NAVIGATION'] },
    { name: 'Sumac', theme: 'Tart red spice', accent: ACCENTS[0], words: ['SUMAC', 'TART', 'RED', 'POWDER', 'MIDDLEEAST', 'ZAATAR', 'LEMON', 'SPICE', 'DRIZZLE', 'BLEND'] },
    { name: 'Tapir', theme: 'Forest browser', accent: ACCENTS[3], words: ['TAPIR', 'SNOUT', 'BROWSER', 'RAINFOREST', 'ASIA', 'SOUTHAMERICA', 'STRIPED', 'CALF', 'NOCTURNAL', 'HERBIVORE'] },
    { name: 'Capstan', theme: 'Vertical winch', accent: ACCENTS[9], words: ['CAPSTAN', 'WINCH', 'VERTICAL', 'BAR', 'ROPE', 'ANCHOR', 'WINDLASS', 'PAWL', 'BARREL', 'SHIP'] },
    { name: 'Forsythia', theme: 'Golden spring', accent: ACCENTS[2], words: ['FORSYTHIA', 'YELLOW', 'GOLDEN', 'SPRING', 'BLOOM', 'BRANCH', 'SHRUB', 'STEM', 'BUD', 'HEDGE'] },
    { name: 'Knarr', theme: 'Viking cargo', accent: ACCENTS[4], words: ['KNARR', 'VIKING', 'CARGO', 'HULL', 'SAIL', 'MAST', 'STEERBOARD', 'BALTIC', 'ATLANTIC', 'TRADE'] },
  ],
  // Set 53
  [
    { name: 'Lupus', theme: 'The wolf', accent: ACCENTS[0], words: ['LUPUS', 'WOLF', 'STAR', 'SOUTHERN', 'CONSTELLATION', 'CENTAURUS', 'MEN', 'GAMMA', 'BINARY', 'NOVA'] },
    { name: 'Coriander', theme: 'Seed and leaf', accent: ACCENTS[3], words: ['CORIANDER', 'CILANTRO', 'SEED', 'LEAF', 'HERB', 'SPICE', 'GREEN', 'CURRY', 'SALSA', 'CHUTNEY'] },
    { name: 'Cassowary', theme: 'Dangerous bird', accent: ACCENTS[7], words: ['CASSOWARY', 'CASQUE', 'CLAW', 'BLUE', 'NECK', 'RAINFOREST', 'AUSTRALIA', 'FLIGHTLESS', 'FRUIT', 'DANGEROUS'] },
    { name: 'Windlass', theme: 'Horizontal winch', accent: ACCENTS[6], words: ['WINDLASS', 'WINCH', 'HORIZONTAL', 'BAR', 'CHAIN', 'CABLE', 'ANCHOR', 'PAWL', 'GEAR', 'LIFT'] },
    { name: 'Camellia', theme: 'Winter rose', accent: ACCENTS[0], words: ['CAMELLIA', 'BLOOM', 'WINTER', 'ROSE', 'PINK', 'RED', 'WHITE', 'SHRUB', 'TEA', 'EVERGREEN'] },
    { name: 'Longship', theme: 'Viking raider', accent: ACCENTS[9], words: ['LONGSHIP', 'VIKING', 'OAR', 'SAIL', 'DRAGON', 'SHIELD', 'STEERBOARD', 'KEEL', 'CREW', 'RAID'] },
  ],
  // Set 54
  [
    { name: 'Bootes', theme: 'The herdsman', accent: ACCENTS[2], words: ['BOOTES', 'HERDSMAN', 'ARCTURUS', 'STAR', 'KITE', 'NEKAR', 'IZAR', 'SEGINUS', 'CORONABORE', 'CONSTELLATION'] },
    { name: 'Turmeric', theme: 'Golden root', accent: ACCENTS[1], words: ['TURMERIC', 'ROOT', 'RHIZOME', 'GOLDEN', 'CURRY', 'POWDER', 'STAIN', 'SPICE', 'YELLOW', 'HEALTH'] },
    { name: 'Bilby', theme: 'Desert bandicoot', accent: ACCENTS[3], words: ['BILBY', 'BANDICOOT', 'DESERT', 'AUSTRALIA', 'EAR', 'POUCH', 'NOCTURNAL', 'BURROW', 'SEED', 'INSECT'] },
    { name: 'Anchor', theme: 'Ship holder', accent: ACCENTS[4], words: ['ANCHOR', 'FLUKE', 'SHANK', 'STOCK', 'RING', 'CHAIN', 'BED', 'BUOY', 'SCOPE', 'HOLD'] },
    { name: 'Dahlia', theme: 'Showy bloom', accent: ACCENTS[7], words: ['DAHLIA', 'TUBER', 'BLOOM', 'SHOWY', 'POMPON', 'CACTUS', 'DINNERPLATE', 'RED', 'PINK', 'PEACH'] },
    { name: 'Junk', theme: 'Chinese sail', accent: ACCENTS[6], words: ['JUNK', 'CHINESE', 'SAIL', 'BATTEN', 'HULL', 'RUDDER', 'MAST', 'CARGO', 'TRADER', 'SEA'] },
  ],
  // Set 55
  [
    { name: 'Cepheus', theme: 'The king', accent: ACCENTS[4], words: ['CEPHEUS', 'KING', 'STAR', 'ALDERAMIN', 'ALFIRK', 'ERRAI', 'DELTA', 'VARIABLE', 'CONSTELLATION', 'NORTHERN'] },
    { name: 'Fenugreek', theme: 'Golden seed', accent: ACCENTS[2], words: ['FENUGREEK', 'SEED', 'LEAF', 'SPICE', 'CURRY', 'BITTER', 'AROMA', 'MAPLE', 'YELLOW', 'INDIA'] },
    { name: 'Quoll', theme: 'Spotted marsupial', accent: ACCENTS[0], words: ['QUOLL', 'SPOTTED', 'MARSUPIAL', 'CARNIVORE', 'AUSTRALIA', 'NOCTURNAL', 'POUCH', 'TAIL', 'FOREST', 'SAVANNA'] },
    { name: 'Mooring', theme: 'Tying up', accent: ACCENTS[5], words: ['MOORING', 'LINE', 'BUOY', 'ANCHOR', 'CLEAT', 'BITT', 'PILE', 'HAWSER', 'BREAST', 'SPRING'] },
    { name: 'Gardenia', theme: 'White fragrance', accent: ACCENTS[8], words: ['GARDENIA', 'WHITE', 'FRAGRANCE', 'BLOOM', 'SHRUB', 'WAXY', 'PETAL', 'GLOSSY', 'EVERGREEN', 'CORSAGE'] },
    { name: 'Caravel', theme: 'Explorer ship', accent: ACCENTS[9], words: ['CARAVEL', 'PORTUGUESE', 'LATIN', 'SQUARE', 'SAIL', 'HULL', 'EXPLORER', 'COLUMBUS', 'CARDBOARD', 'MIZZEN'] },
  ],
  // Set 56
  [
    { name: 'Draco', theme: 'The dragon', accent: ACCENTS[6], words: ['DRACO', 'DRAGON', 'THUBAN', 'ELTANIN', 'RASALHAGUE', 'STAR', 'CONSTELLATION', 'CIRCUMPOLAR', 'CATSEYE', 'NEBULA'] },
    { name: 'Papaya', theme: 'Tropical fruit', accent: ACCENTS[1], words: ['PAPAYA', 'TROPICAL', 'FRUIT', 'PAPAIN', 'YELLOW', 'ORANGE', 'SEED', 'LEAF', 'TREE', 'SMOOTHIE'] },
    { name: 'Numbat', theme: 'Banded eater', accent: ACCENTS[3], words: ['NUMBAT', 'BANDED', 'TERMITE', 'AUSTRALIA', 'TONGUE', 'CLAW', 'DAYTIME', 'EUCALYPTUS', 'LOG', 'MARSUPIAL'] },
    { name: 'Hawser', theme: 'Heavy line', accent: ACCENTS[5], words: ['HAWSER', 'LINE', 'ROPE', 'THICK', 'BRAID', 'TWIST', 'MOORING', 'TOW', 'CHAFING', 'COIL'] },
    { name: 'Plumeria', theme: 'Lei flower', accent: ACCENTS[7], words: ['PLUMERIA', 'LEI', 'FRANGIPANI', 'WHITE', 'YELLOW', 'PINK', 'TROPICAL', 'BLOOM', 'FRAGRANCE', 'TREE'] },
    { name: 'Galleon', theme: 'Treasure ship', accent: ACCENTS[9], words: ['GALLEON', 'SPANISH', 'TREASURE', 'GUN', 'DECK', 'SAIL', 'MAST', 'STERN', 'BOW', 'GALLEON'] },
  ],
  // Set 57
  [
    { name: 'Sagitta', theme: 'The arrow', accent: ACCENTS[0], words: ['SAGITTA', 'ARROW', 'STAR', 'GAMMA', 'DELTA', 'ETA', 'SMALL', 'NORTHERN', 'CONSTELLATION', 'SHOOT'] },
    { name: 'Lovage', theme: 'Celery herb', accent: ACCENTS[3], words: ['LOVAGE', 'CELERY', 'HERB', 'LEAF', 'STALK', 'SEED', 'SOUP', 'STEW', 'BROTH', 'PEPPER'] },
    { name: 'Tasmaniandevil', theme: 'Marsupial scavenger', accent: ACCENTS[0], words: ['TASMANIANDEVIL', 'SCAVENGER', 'MARSUPIAL', 'TASMANIA', 'BLACK', 'FUR', 'JAW', 'CRUNCH', 'NOCTURNAL', 'POUCH'] },
    { name: 'Bollard', theme: 'Tie post', accent: ACCENTS[8], words: ['BOLLARD', 'POST', 'CLEAT', 'BITT', 'MOORING', 'LINE', 'DECK', 'QUAY', 'WHARF', 'BRIGHT'] },
    { name: 'Oleander', theme: 'Toxic bloom', accent: ACCENTS[7], words: ['OLEANDER', 'TOXIC', 'PINK', 'WHITE', 'RED', 'SHRUB', 'MEDITERRANEAN', 'EVERGREEN', 'LEAF', 'SAP'] },
    { name: 'Flyboat', theme: 'Dutch trader', accent: ACCENTS[4], words: ['FLYBOAT', 'DUTCH', 'TRADER', 'HULL', 'SAIL', 'FLAT', 'CARGO', 'SHALLOW', 'MAST', 'BULK'] },
  ],
  // Set 58
  [
    { name: 'Delphinus', theme: 'The dolphin', accent: ACCENTS[5], words: ['DELPHINUS', 'DOLPHIN', 'STAR', 'SUALOCIN', 'ROTANEV', 'CONSTELLATION', 'SMALL', 'NORTHERN', 'NEBULA', 'CLUSTER'] },
    { name: 'Perilla', theme: 'Shiso leaf', accent: ACCENTS[3], words: ['PERILLA', 'SHISO', 'LEAF', 'PURPLE', 'GREEN', 'ASIAN', 'HERB', 'MINT', 'BASIL', 'SEED'] },
    { name: 'Wombat', theme: 'Digging marsupial', accent: ACCENTS[1], words: ['WOMBAT', 'DIG', 'BURROW', 'MARSUPIAL', 'AUSTRALIA', 'CUBIC', 'POUCH', 'NOCTURNAL', 'HERBIVORE', 'STURDY'] },
    { name: 'Fender', theme: 'Hull protector', accent: ACCENTS[6], words: ['FENDER', 'HULL', 'PROTECT', 'RUB', 'DOCK', 'BOAT', 'ROPE', 'CUSHION', 'HANG', 'PILE'] },
    { name: 'Bouvardia', theme: 'Tubular bloom', accent: ACCENTS[0], words: ['BOUVARDIA', 'TUBULAR', 'BLOOM', 'WHITE', 'PINK', 'RED', 'SHRUB', 'FRAGRANCE', 'FLOWER', 'STEM'] },
    { name: 'Pinnace', theme: 'Small boat', accent: ACCENTS[9], words: ['PINNACE', 'SMALL', 'BOAT', 'OAR', 'SAIL', 'TENDER', 'SHIP', 'DECK', 'MAST', 'RIVER'] },
  ],
  // Set 59
  [
    { name: 'Equuleus', theme: 'The foal', accent: ACCENTS[2], words: ['EQUULEUS', 'FOAL', 'HORSE', 'STAR', 'KITALPHA', 'DELTA', 'SMALL', 'NORTHERN', 'CONSTELLATION', 'FAINT'] },
    { name: 'Chervil', theme: 'French herb', accent: ACCENTS[3], words: ['CHERVIL', 'FRENCH', 'HERB', 'LEAF', 'ANISE', 'PARSLEY', 'SOUP', 'OMELET', 'SPRING', 'GARNISH'] },
    { name: 'Bandicoot', theme: 'Pointy snout', accent: ACCENTS[1], words: ['BANDICOOT', 'SNOUT', 'MARSUPIAL', 'AUSTRALIA', 'INSECT', 'NOCTURNAL', 'BURROW', 'HOP', 'TAIL', 'POUCH'] },
    { name: 'Cleat', theme: 'Line tie', accent: ACCENTS[8], words: ['CLEAT', 'TIE', 'LINE', 'ROPE', 'DECK', 'HORN', 'BITT', 'BOLLARD', 'SECURE', 'HITCH'] },
    { name: 'Nerine', theme: 'Autumn lily', accent: ACCENTS[7], words: ['NERINE', 'LILY', 'AUTUMN', 'BLOOM', 'PINK', 'RED', 'WHITE', 'BULB', 'STEM', 'PETAL'] },
    { name: 'Sloop', theme: 'Single mast', accent: ACCENTS[4], words: ['SLOOP', 'MAST', 'JIB', 'MAINSAIL', 'BOW', 'STERN', 'HULL', 'KEEL', 'RUDDER', 'SAIL'] },
  ],
  // Set 60
  [
    { name: 'Pegasus', theme: 'Winged horse', accent: ACCENTS[6], words: ['PEGASUS', 'HORSE', 'WING', 'STAR', 'MARKAB', 'SCHEAT', 'ALGENIB', 'ENIF', 'SQUARE', 'CONSTELLATION'] },
    { name: 'Borage', theme: 'Blue herb', accent: ACCENTS[4], words: ['BORAGE', 'BLUE', 'HERB', 'STARFLOWER', 'LEAF', 'CUCUMBER', 'SALAD', 'OIL', 'SEED', 'STEM'] },
    { name: 'Cuscus', theme: 'Tree marsupial', accent: ACCENTS[3], words: ['CUSCUS', 'TREE', 'MARSUPIAL', 'NEWGUINEA', 'FUR', 'TAIL', 'NOCTURNAL', 'LEAF', 'FRUIT', 'POUCH'] },
    { name: 'Cathead', theme: 'Beam support', accent: ACCENTS[9], words: ['CATHEAD', 'BEAM', 'ANCHOR', 'SUPPORT', 'SHIP', 'BOW', 'TIMBER', 'PROJECT', 'ROLLER', 'CHAIN'] },
    { name: 'Protea', theme: 'African bloom', accent: ACCENTS[0], words: ['PROTEA', 'AFRICAN', 'BLOOM', 'PINK', 'RED', 'WHITE', 'SHRUB', 'FYNBOS', 'CAPE', 'EVERGREEN'] },
    { name: 'Cutter', theme: 'Fast sail', accent: ACCENTS[5], words: ['CUTTER', 'SAIL', 'JIB', 'STAYSAIL', 'MAST', 'BOWSPRIT', 'HULL', 'KEEL', 'FAST', 'COAST'] },
  ],
  // Set 61
  [
    { name: 'UrsaMajor', theme: 'Great bear', accent: ACCENTS[4], words: ['URSAMAJOR', 'BEAR', 'DUBHE', 'MERAK', 'PHAD', 'MEGREZ', 'ALIOTH', 'MIZAR', 'ALKAID', 'DIPPER'] },
    { name: 'Sorrel', theme: 'Sour leaf', accent: ACCENTS[3], words: ['SORREL', 'SOUR', 'LEAF', 'HERB', 'GREEN', 'SOUP', 'SAUCE', 'FRENCH', 'TART', 'SPINACH'] },
    { name: 'Kookaburra', theme: 'Laughing bird', accent: ACCENTS[1], words: ['KOOKABURRA', 'LAUGH', 'KINGFISHER', 'AUSTRALIA', 'BROWN', 'BEAK', 'TREE', 'SNAKE', 'NOCTURNAL', 'CHORUS'] },
    { name: 'Bowsprit', theme: 'Bow spar', accent: ACCENTS[6], words:['BOWSPRIT', 'SPAR', 'BOW', 'JIB', 'STAYSAIL', 'HEADSAIL', 'SHIP', 'TIMBER', 'PROJECT', 'CHAIN'] },
    { name: 'Banksia', theme: 'Bottlebrush', accent: ACCENTS[2], words: ['BANKSIA', 'BOTTLEBRUSH', 'SPIKE', 'YELLOW', 'ORANGE', 'RED', 'SHRUB', 'AUSTRALIA', 'NECTAR', 'SEEDPOD'] },
    { name: 'Yawl', theme: 'Two-mast sail', accent: ACCENTS[5], words: ['YAWL', 'MAST', 'MIZZEN', 'MAINSAIL', 'JIB', 'HULL', 'KEEL', 'STERN', 'SAIL', 'RIG'] },
  ],
  // Set 62
  [
    { name: 'UrsaMinor', theme: 'Little bear', accent: ACCENTS[5], words: ['URSAMINOR', 'BEAR', 'POLARIS', 'KOCHAB', 'PHERKAD', 'LITTLE', 'DIPPER', 'STAR', 'CONSTELLATION', 'NORTHERN'] },
    { name: 'Burnet', theme: 'Cucumber herb', accent: ACCENTS[3], words: ['BURNET', 'CUCUMBER', 'HERB', 'LEAF', 'SALAD', 'SOUP', 'PIMPERNEL', 'NUTTY', 'GREEN', 'COOL'] },
    { name: 'Lyrebird', theme: 'Mimic bird', accent: ACCENTS[0], words: ['LYREBIRD', 'MIMIC', 'TAIL', 'AUSTRALIA', 'RAINBOW', 'MALE', 'SONG', 'DISPLAY', 'FOREST', 'DANCE'] },
    { name: 'Mizzen', theme: 'Aft mast', accent: ACCENTS[9], words: ['MIZZEN', 'MAST', 'SAIL', 'AFT', 'STERN', 'YAWL', 'KETCH', 'BOOM', 'GAFF', 'RIG'] },
    { name: 'Grevillea', theme: 'Spider flower', accent: ACCENTS[1], words: ['GREVILLEA', 'SPIDER', 'FLOWER', 'RED', 'YELLOW', 'ORANGE', 'SHRUB', 'AUSTRALIA', 'NECTAR', 'BLOOM'] },
    { name: 'Ketch', theme: 'Two-mast rig', accent: ACCENTS[4], words: ['KETCH', 'MAST', 'MIZZEN', 'MAIN', 'SAIL', 'HULL', 'KEEL', 'STERN', 'BOOM', 'RIG'] },
  ],
  // Set 63
  [
    { name: 'CanisMajor', theme: 'Greater dog', accent: ACCENTS[0], words: ['CANISMAJOR', 'DOG', 'SIRIUS', 'MIRZAM', 'WEZEN', 'ADHARA', 'ALUDRA', 'FURHD', 'CONSTELLATION', 'WINTER'] },
    { name: 'Chicory', theme: 'Bitter root', accent: ACCENTS[3], words: ['CHICORY', 'BITTER', 'ROOT', 'LEAF', 'COFFEE', 'BLUE', 'SALAD', 'FORCED', 'BELGIAN', 'ENDIVE'] },
    { name: 'Bowerbird', theme: 'Architect bird', accent: ACCENTS[7], words: ['BOWERBIRD', 'BOWER', 'ARCHITECT', 'MALE', 'DISPLAY', 'BLUE', 'AUSTRALIA', 'NEST', 'DECORATE', 'COURT'] },
    { name: 'Yardarm', theme: 'Spar end', accent: ACCENTS[6], words: ['YARDARM', 'SPAR', 'SAIL', 'SQUARE', 'YARD', 'END', 'BRACE', 'LIFT', 'HALYARD', 'SHIP'] },
    { name: 'Waratah', theme: 'Crimson bloom', accent: ACCENTS[0], words: ['WARATAH', 'CRIMSON', 'BLOOM', 'RED', 'SPIKE', 'SHRUB', 'AUSTRALIA', 'NECTAR', 'FLOWER', 'STEM'] },
    { name: 'Schooner', theme: 'Multi-sail rig', accent: ACCENTS[5], words: ['SCHOONER', 'SAIL', 'MAST', 'FORE', 'AFT', 'JIB', 'STAYSAIL', 'HULL', 'RIG', 'FAST'] },
  ],
  // Set 64
  [
    { name: 'CanisMinor', theme: 'Lesser dog', accent: ACCENTS[1], words: ['CANISMINOR', 'DOG', 'PROCYON', 'GOMEISA', 'LUYTEN', 'STAR', 'SMALL', 'CONSTELLATION', 'WINTER', 'NORTHERN'] },
    { name: 'Rocket', theme: 'Peppery green', accent: ACCENTS[3], words: ['ROCKET', 'ARUGULA', 'PEPPERY', 'LEAF', 'SALAD', 'GREEN', 'BITTER', 'ITALIAN', 'MEDITERRANEAN', 'SPICY'] },
    { name: 'Cockatoo', theme: 'Crested parrot', accent: ACCENTS[8], words: ['COCKATOO', 'CREST', 'PARROT', 'WHITE', 'YELLOW', 'PINK', 'AUSTRALIA', 'BEAK', 'SCREECH', 'FLOCK'] },
    { name: 'Topgallant', theme: 'High sail', accent: ACCENTS[6], words: ['TOPGALLANT', 'SAIL', 'YARD', 'MAST', 'HIGH', 'UPPER', 'SQUARE', 'STAY', 'SAIL', 'SHIP'] },
    { name: 'Kangaroopaw', theme: 'Velvet bloom', accent: ACCENTS[1], words: ['KANGAROOPAW', 'VELVET', 'BLOOM', 'RED', 'YELLOW', 'GREEN', 'SHRUB', 'AUSTRALIA', 'TUBULAR', 'FLOWER'] },
    { name: 'Barque', theme: 'Three-mast rig', accent: ACCENTS[9], words: ['BARQUE', 'MAST', 'SQUARE', 'FORE', 'AFT', 'MIZZEN', 'SAIL', 'HULL', 'RIG', 'SHIP'] },
  ],
  // Set 65
  [
    { name: 'Leo', theme: 'The lion', accent: ACCENTS[2], words: ['LEO', 'LION', 'REGULUS', 'DENEBOLA', 'ALGIEBA', 'ZOZMA', 'CHORT', 'CONSTELLATION', 'ZODIAC', 'SPRING'] },
    { name: 'Endive', theme: 'Bitter leaf', accent: ACCENTS[3], words: ['ENDIVE', 'BITTER', 'LEAF', 'BELGIAN', 'FORCED', 'BLANCH', 'WHITE', 'YELLOW', 'SALAD', 'CRISP'] },
    { name: 'Emu', theme: 'Flightless runner', accent: ACCENTS[0], words: ['EMU', 'FLIGHTLESS', 'RUNNER', 'AUSTRALIA', 'FEATHER', 'EGG', 'BIRD', 'DESERT', 'OUTBACK', 'FAST'] },
    { name: 'Royal', theme: 'Mast top', accent: ACCENTS[7], words: ['ROYAL', 'MAST', 'TOP', 'SAIL', 'YARD', 'SHIP', 'HIGH', 'UPPER', 'SQUARE', 'STAY'] },
    { name: 'Flannel', theme: 'Soft bush', accent: ACCENTS[1], words: ['FLANNEL', 'BUSH', 'SOFT', 'LEAF', 'WHITE', 'YELLOW', 'AUSTRALIA', 'SHRUB', 'BLOOM', 'FELT'] },
    { name: 'Clipper', theme: 'Fast trader', accent: ACCENTS[4], words: ['CLIPPER', 'FAST', 'SAIL', 'SQUARE', 'MAST', 'BOW', 'HULL', 'NARROW', 'TRADE', 'RIG'] },
  ],
  // Set 66
  [
    { name: 'Scorpius', theme: 'The scorpion', accent: ACCENTS[0], words: ['SCORPIUS', 'SCORPION', 'ANTARES', 'SHAULA', 'SARGAS', 'DZHUBBA', 'CLAW', 'TAIL', 'STING', 'ZODIAC'] },
    { name: 'Radicchio', theme: 'Red bitter leaf', accent: ACCENTS[0], words: ['RADICCHIO', 'RED', 'BITTER', 'LEAF', 'ITALIAN', 'CHICORY', 'SALAD', 'WHITE', 'VEIN', 'CRISP'] },
    { name: 'Cassowary', theme: 'Helmet bird', accent: ACCENTS[7], words: ['CASSOWARY', 'HELMET', 'CASQUE', 'BLUE', 'CLAW', 'RAINFOREST', 'AUSTRALIA', 'FLIGHTLESS', 'DANGEROUS', 'FRUIT'] },
    { name: 'Moonsail', theme: 'Topmost sail', accent: ACCENTS[6], words: ['MOONSAIL', 'TOPMOST', 'SAIL', 'MAST', 'YARD', 'SHIP', 'SKYSAIL', 'STAY', 'FLY', 'RIG'] },
    { name: 'Bottlebrush', theme: 'Red spike', accent: ACCENTS[0], words: ['BOTTLEBRUSH', 'RED', 'SPIKE', 'CALLISTEMON', 'SHRUB', 'AUSTRALIA', 'NECTAR', 'BLOOM', 'TREE', 'HONEY'] },
    { name: 'Xebec', theme: 'Mediterranean sail', accent: ACCENTS[5], words: ['XEBEC', 'MEDITERRANEAN', 'SAIL', 'LATEEN', 'OAR', 'HULL', 'PIRATE', 'TRADER', 'MAST', 'BOW'] },
  ],
  // Set 67
  [
    { name: 'Sagittarius', theme: 'The archer', accent: ACCENTS[4], words: ['SAGITTARIUS', 'ARCHER', 'Kaus'.toUpperCase(), 'NUNKI', 'ASCELLA', 'TEAPOT', 'ZODIAC', 'GALACTIC', 'CENTER', 'BOW'] },
    { name: 'Frisee', theme: 'Curly bitter', accent: ACCENTS[3], words: ['FRISEE', 'CURLY', 'BITTER', 'LEAF', 'ENDIVE', 'CHICORY', 'SALAD', 'YELLOW', 'WHITE', 'CRISP'] },
    { name: 'Kiwi', theme: 'Flightless nocturnal', accent: ACCENTS[3], words: ['KIWI', 'FLIGHTLESS', 'NOCTURNAL', 'NEWZEALAND', 'BIRD', 'BEAK', 'BROWN', 'EGG', 'SHRUB', 'PROBE'] },
    { name: 'Studdingsail', theme: 'Extra sail', accent: ACCENTS[8], words: ['STUDDINGSAIL', 'EXTRA', 'SAIL', 'BOOM', 'YARD', 'EXTEND', 'SHIP', 'WIND', 'BOOMIRONS', 'RIG'] },
    { name: 'Wattle', theme: 'Golden puff', accent: ACCENTS[2], words: ['WATTLE', 'GOLDEN', 'PUFF', 'ACACIA', 'YELLOW', 'BLOOM', 'AUSTRALIA', 'TREE', 'NEEDLE', 'FLOWER'] },
    { name: 'Polacre', theme: 'Mediterranean mix', accent: ACCENTS[6], words: ['POLACRE', 'MEDITERRANEAN', 'SAIL', 'LATEEN', 'SQUARE', 'MAST', 'HULL', 'TRADER', 'BOW', 'RIG'] },
  ],
  // Set 68
  [
    { name: 'Capricornus', theme: 'The sea-goat', accent: ACCENTS[8], words: ['CAPRICORNUS', 'SEAGOAT', 'ALGEDI', 'DABIH', 'NASHIRA', 'ZODIAC', 'CONSTELLATION', 'STAR', 'SOUTHERN', 'MYTH'] },
    { name: 'Mizuna', theme: 'Japanese mustard', accent: ACCENTS[3], words: ['MIZUNA', 'JAPANESE', 'MUSTARD', 'GREEN', 'LEAF', 'SALAD', 'PEPPERY', 'SAUTE', 'STIRFRY', 'CRISP'] },
    { name: 'Takahe', theme: 'Rediscovered bird', accent: ACCENTS[7], words: ['TAKAHE', 'FLIGHTLESS', 'RAIL', 'NEWZEALAND', 'BLUE', 'RED', 'BEAK', 'STOUT', 'BIRD', 'REDISCOVERED'] },
    { name: 'Spanker', theme: 'Aft sail', accent: ACCENTS[9], words: ['SPANKER', 'AFT', 'SAIL', 'BOOM', 'GAFF', 'STERN', 'SHIP', 'MAST', 'RIG', 'TRIM'] },
    { name: 'Gymea', theme: 'Giant lily', accent: ACCENTS[1], words: ['GYMEA', 'GIANT', 'LILY', 'RED', 'SPIKE', 'AUSTRALIA', 'FLOWER', 'STEM', 'BIRD', 'NECTAR'] },
    { name: 'Brigantine', theme: 'Mixed rig', accent: ACCENTS[4], words: ['BRIGANTINE', 'MIXED', 'RIG', 'SQUARE', 'FORE', 'AFT', 'SAIL', 'MAST', 'HULL', 'FOREANDAFT'] },
  ],
  // Set 69
  [
    { name: 'Aquarius', theme: 'The water bearer', accent: ACCENTS[5], words: ['AQUARIUS', 'WATER', 'BEARER', 'SADALSUUD', 'SADALMELIK', 'SKAT', 'ZODIAC', 'CONSTELLATION', 'STAR', 'STREAM'] },
    { name: 'Mitsuba', theme: 'Japanese parsley', accent: ACCENTS[3], words: ['MITSUBA', 'JAPANESE', 'PARSLEY', 'LEAF', 'HERB', 'SALAD', 'SOUP', 'STEAM', 'GREEN', 'AROMA'] },
    { name: 'Kakapo', theme: 'Night parrot', accent: ACCENTS[3], words: ['KAKAPO', 'NIGHT', 'PARROT', 'NEWZEALAND', 'OWL', 'FLIGHTLESS', 'GREEN', 'LEK', 'BOOM', 'CRITICAL'] },
    { name: 'Gaff', theme: 'Spar hook', accent: ACCENTS[0], words: ['GAFF', 'SPAR', 'HOOK', 'SAIL', 'MAST', 'BOOM', 'STERN', 'RIG', 'PEAK', 'THROAT'] },
    { name: 'Telopea', theme: 'Waratah genus', accent: ACCENTS[0], words: ['TELOPEA', 'WARATAH', 'RED', 'BLOOM', 'SPIKE', 'SHRUB', 'AUSTRALIA', 'NECTAR', 'FLOWER', 'PROTEA'] },
    { name: 'Hermaphrodite', theme: 'Mixed brig', accent: ACCENTS[6], words: ['HERMAPHRODITE', 'BRIG', 'MIXED', 'SAIL', 'SQUARE', 'FORE', 'AFT', 'MAST', 'RIG', 'SHIP'] },
  ],
  // Set 70
  [
    { name: 'Pisces', theme: 'The fishes', accent: ACCENTS[4], words: ['PISCES', 'FISH', 'ALRESCHA', 'STAR', 'ZODIAC', 'CONSTELLATION', 'VSHA', 'KNOT', 'CORD', 'PAIR'] },
    { name: 'Shiso', theme: 'Beefleaf', accent: ACCENTS[3], words: ['SHISO', 'PERILLA', 'LEAF', 'PURPLE', 'GREEN', 'ASIAN', 'HERB', 'SUSHI', 'UMEBOSHI', 'BASIL'] },
    { name: 'Tuatara', theme: 'Living fossil', accent: ACCENTS[9], words: ['TUATARA', 'LIVING', 'FOSSIL', 'REPTILE', 'NEWZEALAND', 'COLD', 'PARIETAL', 'EYE', 'BURROW', 'ISLAND'] },
    { name: 'Bowsprit', theme: 'Forward spar', accent: ACCENTS[6], words: ['BOWSPRIT', 'SPAR', 'FORWARD', 'BOW', 'JIB', 'STAYSAIL', 'HEADSAIL', 'SHIP', 'TIMBER', 'PROJECT'] },
    { name: 'Karkalla', theme: 'Beach succulent', accent: ACCENTS[3], words: ['KARKALLA', 'BEACH', 'SUCCULENT', 'SALAD', 'LEAF', 'AUSTRALIA', 'CRUNCHY', 'SALTY', 'GREEN', 'COASTAL'] },
    { name: 'Snow', theme: 'White clipper', accent: ACCENTS[5], words: ['SNOW', 'WHITE', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'SQUARED'] },
  ],
  // Set 71
  [
    { name: 'Aries', theme: 'The ram', accent: ACCENTS[0], words: ['ARIES', 'RAM', 'HAMAL', 'SHERATAN', 'MESARTIM', 'ZODIAC', 'STAR', 'CONSTELLATION', 'SPRING', 'NORTHERN'] },
    { name: 'Lamb', theme: 'Spring lettuce', accent: ACCENTS[3], words: ['LAMB', 'LETTUCE', 'SPRING', 'LEAF', 'SALAD', 'TENDER', 'GREEN', 'MILD', 'COOL', 'CRISP'] },
    { name: 'Moah', theme: 'Giant bird', accent: ACCENTS[9], words: ['MOA', 'GIANT', 'BIRD', 'NEWZEALAND', 'EXTINCT', 'FLIGHTLESS', 'EGG', 'BONE', 'HUNTER', 'OSTRICH'] },
    { name: 'Jibboom', theme: 'Extended spar', accent: ACCENTS[6], words: ['JIBBOOM', 'SPAR', 'EXTEND', 'BOWSPRIT', 'JIB', 'SAIL', 'SHIP', 'BOW', 'TIMBER', 'STAY'] },
    { name: 'Muntries', theme: 'Apple berry', accent: ACCENTS[2], words: ['MUNTRIES', 'APPLE', 'BERRY', 'AUSTRALIA', 'SHRUB', 'GREEN', 'SWEET', 'SPICE', 'LEAF', 'GROUND'] },
    { name: 'Flying', theme: 'Cloud clipper', accent: ACCENTS[5], words: ['FLYING', 'CLOUD', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'SQUARE'] },
  ],
  // Set 72
  [
    { name: 'Taurus', theme: 'The bull', accent: ACCENTS[1], words: ['TAURUS', 'BULL', 'ALDEBARAN', 'PLEIADES', 'HYADES', 'ELNATH', 'ZODIAC', 'STAR', 'CONSTELLATION', 'WINTER'] },
    { name: 'Claytonia', theme: 'Miner lettuce', accent: ACCENTS[3], words: ['CLAYTONIA', 'MINER', 'LETTUCE', 'SUCCULENT', 'LEAF', 'SALAD', 'GREEN', 'MILD', 'WINTER', 'FORAGE'] },
    { name: 'Weka', theme: 'Flightless rail', accent: ACCENTS[0], words: ['WEKA', 'FLIGHTLESS', 'RAIL', 'NEWZEALAND', 'BROWN', 'BIRD', 'CURIOUS', 'OMNIVORE', 'GROUND', 'BOLD'] },
    { name: 'Dolphin', theme: 'Bow striker', accent: ACCENTS[5], words: ['DOLPHIN', 'STRIKER', 'BOW', 'SPAR', 'SHIP', 'TIMBER', 'ANCHOR', 'CURVE', 'SUPPORT', 'HEAD'] },
    { name: 'Lillypilly', theme: 'Bush food', accent: ACCENTS[7], words: ['LILLYPILLY', 'BUSH', 'FOOD', 'AUSTRALIA', 'BERRY', 'PINK', 'RED', 'SHRUB', 'TART', 'JAM'] },
    { name: 'Thermopylae', theme: 'Tea clipper', accent: ACCENTS[6], words: ['THERMOPYLAE', 'TEA', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'RACE'] },
  ],
  // Set 73
  [
    { name: 'Gemini', theme: 'The twins', accent: ACCENTS[4], words: ['GEMINI', 'TWINS', 'CASTOR', 'POLLUX', 'ALHENA', 'MEBSUTA', 'ZODIAC', 'STAR', 'CONSTELLATION', 'WINTER'] },
    { name: 'Saladburnet', theme: 'Cucumber leaf', accent: ACCENTS[3], words: ['SALADBURNET', 'CUCUMBER', 'LEAF', 'HERB', 'PIMPERNEL', 'NUTTY', 'SALAD', 'SOUP', 'COOL', 'GREEN'] },
    { name: 'Pukeko', theme: 'Swamp hen', accent: ACCENTS[7], words: ['PUKEKO', 'SWAMP', 'HEN', 'NEWZEALAND', 'BLUE', 'RED', 'BEAK', 'RAIL', 'WETLAND', 'BOLD'] },
    { name: 'Bowsie', theme: 'Bow sail', accent: ACCENTS[8], words: ['BOWSIE', 'BOW', 'SAIL', 'WATER', 'SPRAY', 'SHIP', 'DECK', 'WIND', 'WAVE', 'FOAM'] },
    { name: 'Macadamia', theme: 'Bush nut', accent: ACCENTS[1], words: ['MACADAMIA', 'BUSH', 'NUT', 'AUSTRALIA', 'CRUNCHY', 'SHELL', 'OIL', 'BUTTER', 'ROASTED', 'TREE'] },
    { name: 'CuttySark', theme: 'Tea clipper', accent: ACCENTS[6], words: ['CUTTYSARK', 'TEA', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'MUSEUM'] },
  ],
  // Set 74
  [
    { name: 'Cancer', theme: 'The crab', accent: ACCENTS[3], words: ['CANCER', 'CRAB', 'TARF', 'ACUBENS', 'ASELLUS', 'PRAESEPE', 'ZODIAC', 'STAR', 'CONSTELLATION', 'SPRING'] },
    { name: 'GoodKingHenry', theme: 'Wild spinach', accent: ACCENTS[3], words: ['GOODKINGHENRY', 'WILD', 'SPINACH', 'LEAF', 'HERB', 'FORAGE', 'GREEN', 'IRON', 'COOK', 'EUROPE'] },
    { name: 'Kiwi', theme: 'Apex bird', accent: ACCENTS[3], words: ['KIWI', 'APEX', 'BIRD', 'NEWZEALAND', 'NOCTURNAL', 'BEAK', 'BROWN', 'EGG', 'PROBE', 'SHRUB'] },
    { name: 'Bowsprit', theme: 'Spar tip', accent: ACCENTS[6], words: ['BOWSPRIT', 'SPAR', 'TIP', 'JIB', 'STAY', 'SHIP', 'FORWARD', 'TIMBER', 'BOW', 'PROJECT'] },
    { name: 'Riberry', theme: 'Lilly pilly', accent: ACCENTS[0], words: ['RIBERRY', 'LILLY', 'PILLY', 'AUSTRALIA', 'BERRY', 'RED', 'TART', 'JAM', 'SHRUB', 'BUSH'] },
    { name: 'Challenger', theme: 'Tea clipper', accent: ACCENTS[6], words: ['CHALLENGER', 'TEA', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'RACE'] },
  ],
  // Set 75
  [
    { name: 'Virgo', theme: 'The maiden', accent: ACCENTS[3], words: ['VIRGO', 'MAIDEN', 'SPICA', 'VINDEMIATRIX', 'ZAVIJAVA', 'ZODIAC', 'STAR', 'CONSTELLATION', 'SPRING', 'GALAXY'] },
    { name: 'Portulac', theme: 'Purslane', accent: ACCENTS[3], words: ['PORTULAC', 'PURSLANE', 'SUCCULENT', 'LEAF', 'SALAD', 'GREEN', 'OMEGA', 'TART', 'CRISP', 'GROUND'] },
    { name: 'Huia', theme: 'Extinct wattlebird', accent: ACCENTS[0], words: ['HUIA', 'EXTINCT', 'WATTLEBIRD', 'NEWZEALAND', 'BLACK', 'BEAK', 'TAIL', 'BONE', 'MALE', 'FEMALE'] },
    { name: 'Martingale', theme: 'Bow stay', accent: ACCENTS[8], words: ['MARTINGALE', 'BOW', 'STAY', 'SPAR', 'JIB', 'SHIP', 'TENSION', 'DOLPHIN', 'STRIKER', 'RIG'] },
    { name: 'Lemonmyrtle', theme: 'Citrus leaf', accent: ACCENTS[2], words: ['LEMONMYRTLE', 'CITRUS', 'LEAF', 'AUSTRALIA', 'SHRUB', 'OIL', 'AROMA', 'TEA', 'SPICE', 'WHITE'] },
    { name: 'Taeping', theme: 'Tea clipper', accent: ACCENTS[6], words: ['TAEPING', 'TEA', 'CLIPPER', 'SAIL', 'FAST', 'BOW', 'HULL', 'MAST', 'RIG', 'RACE'] },
  ],
];

export function buildPuzzles(setIndex: number): Puzzle[] {
  const set = FACE_SETS[setIndex % FACE_SETS.length];
  return set.map((f, i) => makePuzzle(i, f.name, f.theme, f.accent, f.words, (setIndex + 1) * 1000 + (i + 1) * 101));
}

/**
 * Pick a random category set index in O(log n) using binary search.
 *
 * We generate a uniform random number in [0, FACE_SETS.length) and then
 * binary-search the implicit index array (0..N-1) to find the floor index
 * that maps to that value. For a uniform integer this collapses to the
 * value itself, but the binary-search path demonstrates the technique and
 * keeps the door open for weighted distribution — each set could carry a
 * weight and we'd binary-search the cumulative-weight array instead.
 */
export function pickRandomSetIndex(exclude?: number): number {
  const n = FACE_SETS.length;

  // Build a cumulative weight array (uniform: each entry = 1).
  // In a weighted future, this would be non-trivial.
  const cumWeights: number[] = new Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += 1;
    cumWeights[i] = total;
  }

  // Draw a random target in [1, total].
  let target = Math.floor(Math.random() * total) + 1;

  // Binary search for the first index whose cumulative weight >= target.
  let lo = 0;
  let hi = n - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (cumWeights[mid] >= target) {
      result = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  // Avoid picking the same set twice in a row if there's more than one.
  if (exclude !== undefined && result === exclude && n > 1) {
    target = Math.floor(Math.random() * (total - 1)) + 1;
    // Re-run binary search with the adjusted target, skipping the excluded index.
    lo = 0;
    hi = n - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (cumWeights[mid] >= target) {
        result = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    if (result === exclude) result = (exclude + 1) % n;
  }

  return result;
}

export function totalWordCount(puzzles: Puzzle[]): number {
  return puzzles.reduce((n, p) => n + p.words.length, 0);
}

// Back-compat for any importer expecting a static PUZZLES export
export const PUZZLES: Puzzle[] = buildPuzzles(0);
