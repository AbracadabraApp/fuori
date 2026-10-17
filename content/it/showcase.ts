/**
 * Which Italian places the app shows, and which cities are on the first screen
 * (Josh, 2026-10-12: Italy felt overbuilt at 20 cities × ~30 places; trimmed to
 * Mexico's shape, 8 × 10. 2026-10-14: every city shows ~10 places; 8 cities are
 * on the first screen, the rest after "Mostra altro" and at the station).
 *
 * Nothing is deleted: every city file stays complete and tested, and learner
 * memory tied to a hidden person stays in the database. To show a place, add
 * its id to its city's list; to move a city to the first screen, add it to
 * homeCities. A city shows its listed places, in the feed's usual order.
 * Mexico has no showcase file: everything there is shown.
 *
 * Hidden on purpose (Josh, 2026-10-13): Rita's apartment (the game has no
 * time or rest, it's about going out to places) and Giulia's bar (no
 * character should be special). Both stay in roma.ts as ordinary characters.
 */
export const showcase: Record<string, string[]> = {
  roma: [
    'bar-monti-corner',
    'bar-testaccio-morning',
    'forno-trastevere',
    'mercato-san-cosimato',
    'trattoria-trastevere',
    'farmacia-trastevere',
    'piazza-santa-maria-trastevere',
    'libreria-trastevere',
    'enoteca-trastevere',
    'villa-borghese',
    'scuola-lingua-roma', // M2: language school with Magda
    'stazione-termini', // M2: train station for travel
  ],
  matera: [
    'caffe-schiuma',
    'panificio-del-sasso',
    'mercato-piccianello',
    'ristorante-francesca',
    'bar-vitantonio',
    'gelateria-artigiana',
    'piazza-vittorio',
    'bottega-artigiana',
    'enoteca-lucania',
    'libreria-matera',
    'piazza-duomo', // M2: bench character Alberto (pensionato)
    'scuola-lingua-matera', // M2: language school with Magda
    'stazione-fal', // M2: train station for travel
  ],
  firenze: [
    'caffe-rivoire',
    'forno-galli',
    'mercato-centrale',
    'trattoria-mario',
    'bar-del-moro',
    'gelateria-vivoli',
    'farmacia-molteni',
    'piazza-signoria',
    'officina-profumo',
    'enoteca-alessi',
    'piazza-santo-spirito', // M2: bench character Alessia (studentessa d'arte)
    'scuola-lingua-firenze', // M2: language school with Magda
    'stazione-smn', // M2: train station for travel
  ],
  siena: [
    'caffe-fiorella',
    'pasticceria-bini',
    'mercato-della-terra',
    'osteria-le-logge',
    'bar-il-palio',
    'gelateria-brivido',
    'piazza-del-campo',
    'bottega-del-palio',
    'enoteca-san-domenico',
    'libreria-senese',
    'piazza-salimbeni', // M2: bench character Beatrice (studentessa)
    'scuola-lingua-siena', // M2: language school with Magda
    'stazione-siena', // M2: train station for travel
  ],
  venezia: [
    'bar-al-timon',
    'panificio-volpe',
    'mercato-rialto',
    'ristorante-antiche-carampane',
    'caffe-florian',
    'farmacia-morelli',
    'campo-santa-margherita',
    'squero-san-trovaso',
    'enoteca-mascareta',
    'libreria-acqua-alta',
    'campo-dei-mori', // M2: bench character Dante (storico locale)
    'scuola-lingua-venezia', // M2: language school with Magda
    'stazione-santa-lucia', // M2: train station for travel
  ],
  napoli: [
    'bar-nilo',
    'pasticceria-poppella',
    'mercato-pignasecca',
    'pizzeria-sorbillo',
    'caffe-gambrinus',
    'gay-odin',
    'piazza-bellini',
    'salumeria-upnea',
    'enoteca-belledonne',
    'libreria-dante-descartes',
    'spaccanapoli-street', // M2: bench character Nonna Assunta (Via Spaccanapoli) (abitante del quartiere)
    'scuola-lingua-napoli', // M2: language school with Magda
    'stazione-centrale-napoli', // M2: train station for travel
  ],
  bologna: [
    'caffe-terzi',
    'forno-brisa',
    'mercato-mezzo',
    'ristorante-pappagallo',
    'bar-senza-nome',
    'cremeria-funivia',
    'farmacia-comunale',
    'piazza-maggiore',
    'salumeria-simoni',
    'cantina-bentivoglio',
    'piazza-verdi', // M2: bench character Clara (studentessa)
    'scuola-lingua-bologna', // M2: language school with Magda
    'stazione-centrale', // M2: train station for travel
  ],
  palermo: [
    'bar-alba',
    'panificio-morello',
    'mercato-ballaro',
    'trattoria-ai-cascinari',
    'caffe-del-kassaro',
    'piazza-pretoria',
    'enoteca-picone',
    'libreria-del-mare',
    'giardino-garibaldi',
    'osteria-ballarò',
    'scuola-lingua-palermo', // M2: language school with Magda
    'stazione-centrale-palermo', // M2: train station for travel
  ],
  // Not on the first screen of the city list: reached through "Mostra altro" or
  // the station (Josh, 2026-10-14). 10 places each, same mix, plus the station
  // and language school where the city has them.
  taormina: [
    'bar-turrisi',
    'pasticceria-etna',
    'mercato-giardini',
    'ristorante-baronessa',
    'caffe-wunderbar',
    'gelateria-paradiso',
    'farmacia-centrale-taormina',
    'piazza-ix-aprile',
    'salumeria-sicilia',
    'enoteca-nero',
    'stazione-taormina-giardini', // station (2026-10-14)
  ],
  lecce: [
    'caffe-alvino',
    'panificio-fiore',
    'mercato-comunale',
    'alle-due-corti',
    'bar-della-vittoria',
    'gelateria-natale',
    'farmacia-centrale-lecce',
    'piazza-santoronzo',
    'bottega-cartapesta',
    'enoteca-mamma-elvira',
    'stazione-lecce',
  ],
  milano: [
    'pasticceria-marchesi',
    'panificio-davide-longoni',
    'mercato-di-porta-romana',
    'trattoria-masuelli',
    'bar-rita',
    'gelateria-navigli',
    'farmacia-centrale-milano',
    'piazza-santo-stefano',
    'peck',
    'enoteca-brera',
    'scuola-lingua-milano',
    'stazione-porta-garibaldi',
  ],
  verona: [
    'caffe-wallner',
    'panificio-mariga',
    'mercato-piazza-erbe',
    'ristorante-dodici-apostoli',
    'bar-ai-scalzi',
    'gelateria-ponte-pietra',
    'farmacia-centrale-verona',
    'piazza-bra',
    'salumeria-albertini',
    'enoteca-cangrande',
    'stazione-porta-nuova',
  ],
  assisi: [
    'caffe-duomo',
    'forno-santa-maria',
    'mercato-coperto',
    'ristorante-metastasio',
    'bar-senso',
    'gelateria-santa-maria',
    'farmacia-centrale',
    'piazza-comune',
    'tabaccheria-assisi',
    'enoteca-properzio',
    'stazione-assisi', // station (2026-10-14)
  ],
  bergamo: [
    'caffe-del-tasso',
    'panificio-tresoldi',
    'mercato-citta-alta',
    'ristorante-da-vittorio',
    'bar-donizetti',
    'farmacia-centrale-bergamo',
    'piazza-vecchia',
    'enoteca-del-malpaga',
    'libreria-sant-agostino',
    'parco-della-trucca',
    'stazione-bergamo', // station (2026-10-14)
  ],
  torino: [
    'caffe-san-carlo',
    'panetteria-borgo-antico',
    'mercato-porta-palazzo',
    'ristorante-del-cambio',
    'bicerin-dal-1763',
    'guido-gobino',
    'piazza-castello',
    'casa-del-vermouth',
    'enoteca-bacco-torino',
    'libreria-luxemburg',
    'scuola-lingua-torino',
    'stazione-porta-nuova-torino', // station (2026-10-14)
  ],
  siracusa: [
    'bar-dolce-vita',
    'panificio-regina',
    'mercato-ortigia',
    'ristorante-dioniso',
    'caffe-archimede',
    'gelateria-nettuno',
    'farmacia-apollo',
    'piazza-archimede',
    'laboratorio-papiro',
    'enoteca-bacco',
    'stazione-siracusa',
  ],
  genova: [
    'caffe-degli-specchi',
    'pasticceria-liquorosa',
    'mercato-orientale',
    'trattoria-rosmarino',
    'bar-boccadasse',
    'gelateria-profumo',
    'farmacia-europa',
    'piazza-ferrari',
    'salumeria-fontana',
    'enoteca-sola',
    'stazione-principe',
  ],
  lucca: [
    'caffe-di-simo',
    'forno-amedeo-giusti',
    'mercato-del-carmine',
    'ristorante-giglio',
    'bar-il-fortino',
    'farmacia-massei',
    'piazza-anfiteatro',
    'gastronomia-angeli',
    'enoteca-vanni',
    'libreria-baroni',
    'stazione-lucca', // station (2026-10-14)
  ],
  orvieto: [
    'caffe-montanucci',
    'pasticceria-adriano',
    'mercato-coperto-orvieto',
    'ristorante-la-grotta',
    'bar-duomo-orvieto',
    'piazza-del-popolo',
    'bottega-michelangeli',
    'enoteca-al-pozzo',
    'libreria-del-duomo',
    'giardini-pubblici',
    'stazione-orvieto', // station (2026-10-14)
  ],
  mantova: [
    'caffe-modi',
    'panificio-pavesi',
    'mercato-erbe-mantova',
    'ristorante-cigno',
    'bar-delle-erbe',
    'gelateria-ducale',
    'farmacia-gonzaga',
    'piazza-sordello',
    'salumeria-ducale',
    'enoteca-cortile',
    'stazione-mantova',
  ],
};

/** On the first screen of the city list, in this order; the rest come after "Mostra altro" */
export const homeCities = ['roma', 'matera', 'firenze', 'siena', 'venezia', 'napoli', 'bologna', 'palermo'];
