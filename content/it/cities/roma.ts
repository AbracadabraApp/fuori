import { CityPantry } from '@/lib/types';

export const roma: CityPantry = {
  id: 'roma',
  name: 'Roma',

  neighbourhoods: [
    'Trastevere',
    'Monti',
    'Testaccio',
    'Centro Storico',
    'Prati',
    'San Lorenzo',
  ],

  places: [
    // Apartment - where you're staying
    {
      id: 'apartment-trastevere-rita',
      name: 'Your Apartment',
      kind: 'apartment',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a lived-in Trastevere apartment kitchen and sitting room, tall shuttered windows with morning light, family photos on a wooden sideboard, a moka pot on the stove, terracotta floor tiles, plants on the windowsill, warm ochre and cream tones, textured sketch style, loose watercolor washes, lots of white paper',
      characterId: 'rita',
    },

    // Bars - multiple across neighborhoods
    {
      id: 'bar-trastevere-giulia',
      name: 'Bar in Trastevere',
      kind: 'bar',
      neighbourhood: 'Trastevere',
      real: false,
      characterId: 'giulia',
    },
    {
      id: 'bar-monti-corner',
      name: 'Bar Angolo',
      kind: 'bar',
      neighbourhood: 'Monti',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a small corner bar on a sloping cobbled street in Monti, zinc counter, chrome espresso machine, glass case of cornetti, two locals chatting at the counter, ivy on the faded orange wall outside, soft morning light, ochre and sage tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'bar-testaccio-morning',
      name: 'Bar Mattina',
      kind: 'bar',
      neighbourhood: 'Testaccio',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a busy working-class bar in Testaccio at breakfast, regulars standing at the long counter with tiny cups, barista pulling espresso, newspapers on a stool, morning sun through the open doorway, warm amber and brick-red tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Markets
    {
      id: 'mercato-san-cosimato',
      name: 'Mercato di San Cosimato',
      kind: 'market',
      neighbourhood: 'Trastevere',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of an open-air neighbourhood market in a Trastevere square, striped awnings over stalls of tomatoes, artichokes and lemons, vendors chatting with shoppers, old apartment buildings behind, bright morning light, fresh greens and reds, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'mercato-testaccio',
      name: 'Mercato di Testaccio',
      kind: 'market',
      neighbourhood: 'Testaccio',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of a modern covered food market in Testaccio, rows of stalls under a high roof, cheese and cured meats on display, a vendor handing over a paper bag, shoppers with cloth bags, soft daylight, warm wood and pale stone tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'mercato-campo-fiori',
      name: 'Campo de\' Fiori',
      kind: 'market',
      neighbourhood: 'Centro Storico',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the morning market in Campo de Fiori, colorful stalls of flowers, vegetables and spices around the hooded bronze statue, ochre palazzi with green shutters, bustling crowd, bright Roman light, vivid but soft colors, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Bakeries
    {
      id: 'forno-trastevere',
      name: 'Forno in Trastevere',
      kind: 'bakery',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a small Trastevere bakery with a wood-fired oven glowing in the back, trays of pizza bianca and pizza rossa sold by weight, baker in a white apron, paper-wrapped slices on the counter, warm golden tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'forno-monti',
      name: 'Antico Forno',
      kind: 'bakery',
      neighbourhood: 'Monti',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of an old-fashioned bakery in Monti with wooden shelves of bread loaves, glass case of ciambelle and maritozzi, flour on the marble counter, morning light on the tiled floor, warm cream and amber tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Trattorias
    {
      id: 'trattoria-trastevere',
      name: 'Trattoria Romana',
      kind: 'trattoria',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a cozy Roman trattoria in Trastevere at dinner, tables with checked tablecloths spilling onto the cobbled street, plates of cacio e pepe and carbonara, strings of lights, ivy-covered walls, warm evening glow, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'trattoria-testaccio',
      name: 'Osteria Testaccio',
      kind: 'trattoria',
      neighbourhood: 'Testaccio',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a traditional osteria in Testaccio, simple wooden tables, chalkboard menu, carafes of house wine, a waiter carrying plates of pasta, framed photos on cream walls, warm lamplight, terracotta and brown tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Cultural sites - real landmarks
    {
      id: 'basilica-santa-maria',
      name: 'Basilica di Santa Maria in Trastevere',
      kind: 'church',
      neighbourhood: 'Trastevere',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the Basilica di Santa Maria in Trastevere, Romanesque bell tower and golden mosaics on the facade glowing in late afternoon sun, people sitting on the fountain steps in front, warm gold and stone tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'colosseo',
      name: 'Colosseo',
      kind: 'landmark',
      neighbourhood: 'Centro Storico',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the Colosseum seen from a nearby street at golden hour, people walking and a street vendor in the foreground, warm travertine arches, umbrella pines at the edge, soft peach and gold sky, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'fontana-trevi',
      name: 'Fontana di Trevi',
      kind: 'landmark',
      neighbourhood: 'Centro Storico',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the Trevi Fountain crowded with people tossing coins, turquoise water, white marble figures against the palazzo, a gelato cart nearby, bright afternoon light, aqua and cream tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'villa-borghese',
      name: 'Villa Borghese',
      kind: 'park',
      neighbourhood: 'Prati',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of a shaded path in Villa Borghese park, umbrella pines, people cycling and walking dogs, a family on a bench, the small lake with rowboats in the distance, dappled afternoon light, soft greens and golds, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Piazzas - social spaces
    {
      id: 'piazza-santa-maria-trastevere',
      name: 'Piazza Santa Maria in Trastevere',
      kind: 'piazza',
      neighbourhood: 'Trastevere',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the Piazza di Santa Maria in Trastevere in the evening, people gathered on the steps of the central fountain, cafe tables at the edges, street musician playing, warm lamplight on ochre walls, deep blue sky, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'piazza-navona',
      name: 'Piazza Navona',
      kind: 'piazza',
      neighbourhood: 'Centro Storico',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of Piazza Navona on a sunny afternoon, Bernini fountain at the center, street artists at easels, cafe tables under umbrellas, people strolling, long oval of ochre and pink palazzi, light and airy tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Bookshops
    {
      id: 'libreria-trastevere',
      name: 'Libreria Indipendente',
      kind: 'bookshop',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a narrow independent bookshop in Trastevere, books stacked floor to ceiling, a reading chair by the window, a cat asleep on a pile of books, the owner behind a cluttered desk, soft lamplight, warm browns and greens, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'libreria-monti',
      name: 'Libreria di Quartiere',
      kind: 'bookshop',
      neighbourhood: 'Monti',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a bright neighbourhood bookshop in Monti, tables of new Italian novels, hand-written recommendation cards, a reader browsing by the shop window, plants on the shelves, gentle daylight, cream and sage tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Evening spots - wine bars
    {
      id: 'enoteca-trastevere',
      name: 'Enoteca Trastevere',
      kind: 'wine-bar',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a small wine bar in Trastevere at aperitivo hour, wine bottles lining the walls, people with glasses of red at high tables, a board of cheese and salumi, warm candlelight, deep red and amber tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'enoteca-monti',
      name: 'Enoteca Monti',
      kind: 'wine-bar',
      neighbourhood: 'Monti',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a relaxed wine bar on a cobbled Monti street, tables outside under hanging ivy, friends sharing a bottle and small plates, chalkboard of wines by the glass, early evening light, burgundy and gold tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Shops
    {
      id: 'farmacia-trastevere',
      name: 'Farmacia',
      kind: 'pharmacy',
      neighbourhood: 'Trastevere',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a classic Italian pharmacy with a glowing green cross sign, old wooden cabinets and glass jars inside, a pharmacist in a white coat helping a customer, clean tiled floor, soft daylight, mint green and cream tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'negozio-abbigliamento',
      name: 'Negozio di Abbigliamento',
      kind: 'clothing-shop',
      neighbourhood: 'Monti',
      real: false,
      imagePrompt: 'Soft pastel sketch on white paper of a small clothing boutique in Monti, linen shirts and scarves on wooden racks, a shop owner folding sweaters, a full-length mirror, sunlight through the shop window onto the street, soft neutral and dusty rose tones, textured sketch style, loose watercolor washes, lots of white paper',
    },

    // Transportation
    {
      id: 'stazione-termini',
      name: 'Stazione Termini',
      kind: 'train-station',
      neighbourhood: 'Centro Storico',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of the main hall of Rome Termini station, travelers with suitcases, departure board overhead, a coffee bar along one side, people hugging hello, high modern roof with daylight, cool grays with warm accents, textured sketch style, loose watercolor washes, lots of white paper',
    },
    {
      id: 'stazione-trastevere',
      name: 'Stazione Trastevere',
      kind: 'train-station',
      neighbourhood: 'Trastevere',
      real: true,
      imagePrompt: 'Soft pastel sketch on white paper of a small Roman train station platform, a regional train arriving, commuters with bags, a ticket machine and a newsstand, late afternoon light across the tracks, soft blue and ochre tones, textured sketch style, loose watercolor washes, lots of white paper',
    },
  ],

  food: [
    // Roman classics
    'supplì',
    'cacio e pepe',
    'carbonara',
    'amatriciana',
    'gricia',
    'carciofi alla romana',
    'carciofi alla giudia',
    'fiori di zucca',
    'maritozzo',
    'trapizzino',
    'porchetta',
    'saltimbocca',
    'coda alla vaccinara',
    // Everyday items
    'cornetto',
    'caffè',
    'cappuccino',
    'pizza al taglio',
    'pasta',
    'pomodori',
    'mozzarella',
    'parmigiano',
    'pecorino romano',
    'prosciutto',
    'mortadella',
    'pane',
    'vino',
    'acqua',
    'birra',
  ],

  customs: [
    'Pay at the cassa first, then order at the bar with your receipt',
    'Cappuccino is a morning drink; after 11am most Romans switch to caffè',
    'Standing at the bar is cheaper than sitting at a table',
    'Dinner typically starts around 8-9pm, not earlier',
    'Greet shopkeepers when you enter: "Buongiorno"',
    'Sunday morning: the city slows down, many small shops closed',
    'August: many locals leave the city, some restaurants and shops close',
  ],

  localTouches: [
    'daje',       // come on, let's go
    'aò',         // hey (attention-getter)
    'anvedi',     // look at that
    'aho',        // hey, listen
    'du\' spaghi', // two spaghetti (informal for two servings)
  ],

  anchorIds: ['rita', 'giulia'],

  seedCharacters: [
    'Enzo, 60s, theatrical vegetable seller at San Cosimato market',
    'Marco, 50s, calm barista in Monti, morning regular crowd',
    'Sofia, 40s, warm bakery owner, knows everyone in Trastevere',
    'Lucia, 20s, art student who sketches in Piazza Navona',
    'Paolo, 30s, wine bar owner in Monti, passionate about natural wine',
    'Anna, 70s, nonna who sits in Piazza Santa Maria every afternoon',
    'Davide, 30s, bookshop owner, loves recommending Italian novels',
    'Francesca, 40s, pharmacist in Trastevere, helpful and patient',
    'Roberto, 50s, trattoria owner in Testaccio, knows all the Roman dishes',
    'Chiara, 20s, barista in Testaccio, quick and friendly',
  ],

  dayTrips: [
    'Ostia Antica',
    'Tivoli (Villa d\'Este, Villa Adriana)',
    'Orvieto',
    'Castel Gandolfo',
    'Frascati',
  ],
};
