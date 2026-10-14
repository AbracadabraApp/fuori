/**
 * Which Italian cities and places the app shows (Josh, 2026-10-12: Italy felt
 * overbuilt at 20 cities × ~30 places; trimmed to Mexico's shape, 8 × 10).
 *
 * Nothing is deleted: every city file stays complete and tested, and learner
 * memory tied to a hidden person stays in the database. To show a city again,
 * add it here; to show a place, add its id to its city's list. A city listed
 * here shows its listed places, in the feed's usual order.
 * Mexico has no showcase file: everything there is shown.
 *
 * Hidden on purpose (Josh, 2026-10-13): Rita's apartment (the game has no
 * time or rest, it's about going out to places) and Giulia's bar (no
 * character should be special). Both stay in roma.ts as anchors; removing the
 * anchor code is a separate task.
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
    'scuola', // M2: language school with Magda
    'stazione', // M2: train station for travel
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
    'piazza-duomo-matera', // M2: bench character Alberto (pensionato)
    'scuola',
    'stazione',
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
    'scuola',
    'stazione',
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
    'scuola',
    'stazione',
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
    'scuola',
    'stazione',
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
    'via-spaccanapoli', // M2: bench character Nonna Assunta (abitante del quartiere)
    'scuola',
    'stazione',
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
    'scuola',
    'stazione',
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
    'scuola',
    'stazione',
  ],
};
