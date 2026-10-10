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
    },
    {
      id: 'bar-testaccio-morning',
      name: 'Bar Mattina',
      kind: 'bar',
      neighbourhood: 'Testaccio',
      real: false,
    },

    // Markets
    {
      id: 'mercato-san-cosimato',
      name: 'Mercato di San Cosimato',
      kind: 'market',
      neighbourhood: 'Trastevere',
      real: true,
    },
    {
      id: 'mercato-testaccio',
      name: 'Mercato di Testaccio',
      kind: 'market',
      neighbourhood: 'Testaccio',
      real: true,
    },
    {
      id: 'mercato-campo-fiori',
      name: 'Campo de\' Fiori',
      kind: 'market',
      neighbourhood: 'Centro Storico',
      real: true,
    },

    // Bakeries
    {
      id: 'forno-trastevere',
      name: 'Forno in Trastevere',
      kind: 'bakery',
      neighbourhood: 'Trastevere',
      real: false,
    },
    {
      id: 'forno-monti',
      name: 'Antico Forno',
      kind: 'bakery',
      neighbourhood: 'Monti',
      real: false,
    },

    // Trattorias
    {
      id: 'trattoria-trastevere',
      name: 'Trattoria Romana',
      kind: 'trattoria',
      neighbourhood: 'Trastevere',
      real: false,
    },
    {
      id: 'trattoria-testaccio',
      name: 'Osteria Testaccio',
      kind: 'trattoria',
      neighbourhood: 'Testaccio',
      real: false,
    },

    // Cultural sites - real landmarks
    {
      id: 'basilica-santa-maria',
      name: 'Basilica di Santa Maria in Trastevere',
      kind: 'church',
      neighbourhood: 'Trastevere',
      real: true,
    },
    {
      id: 'colosseo',
      name: 'Colosseo',
      kind: 'landmark',
      neighbourhood: 'Centro Storico',
      real: true,
    },
    {
      id: 'fontana-trevi',
      name: 'Fontana di Trevi',
      kind: 'landmark',
      neighbourhood: 'Centro Storico',
      real: true,
    },
    {
      id: 'villa-borghese',
      name: 'Villa Borghese',
      kind: 'park',
      neighbourhood: 'Prati',
      real: true,
    },

    // Piazzas - social spaces
    {
      id: 'piazza-santa-maria-trastevere',
      name: 'Piazza Santa Maria in Trastevere',
      kind: 'piazza',
      neighbourhood: 'Trastevere',
      real: true,
    },
    {
      id: 'piazza-navona',
      name: 'Piazza Navona',
      kind: 'piazza',
      neighbourhood: 'Centro Storico',
      real: true,
    },

    // Bookshops
    {
      id: 'libreria-trastevere',
      name: 'Libreria Indipendente',
      kind: 'bookshop',
      neighbourhood: 'Trastevere',
      real: false,
    },
    {
      id: 'libreria-monti',
      name: 'Libreria di Quartiere',
      kind: 'bookshop',
      neighbourhood: 'Monti',
      real: false,
    },

    // Evening spots - wine bars
    {
      id: 'enoteca-trastevere',
      name: 'Enoteca Trastevere',
      kind: 'wine-bar',
      neighbourhood: 'Trastevere',
      real: false,
    },
    {
      id: 'enoteca-monti',
      name: 'Enoteca Monti',
      kind: 'wine-bar',
      neighbourhood: 'Monti',
      real: false,
    },

    // Shops
    {
      id: 'farmacia-trastevere',
      name: 'Farmacia',
      kind: 'pharmacy',
      neighbourhood: 'Trastevere',
      real: false,
    },
    {
      id: 'negozio-abbigliamento',
      name: 'Negozio di Abbigliamento',
      kind: 'clothing-shop',
      neighbourhood: 'Monti',
      real: false,
    },

    // Transportation
    {
      id: 'stazione-termini',
      name: 'Stazione Termini',
      kind: 'train-station',
      neighbourhood: 'Centro Storico',
      real: true,
    },
    {
      id: 'stazione-trastevere',
      name: 'Stazione Trastevere',
      kind: 'train-station',
      neighbourhood: 'Trastevere',
      real: true,
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
