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
 * character should be special). They lived in the original Roma, removed
 * 2026-11-07 (Josh: "purge the first Rome").
 */
// Bakeries hidden (Josh, 2026-10-27: "the conversation is poor"), except
// Dario's forno in Rome, brought back the same day, and the four pastry shops
// that sell their city's own specialty (Siena, Napoli, Taormina, Genova)
// Wine bars hidden (Josh, 2026-10-27: "not appropriate for all ages")
export const showcase: Record<string, string[]> = {
  // Roma redone (Josh, 2026-10-22; docs/rome-redo.md); the only Rome since the
  // original was removed (2026-11-07).
  'roma-nuova': [
    'cinema-pigneto', // Rome cinema trial (Josh, 2026-11-05): posters and trailers, no person; Pigneto, Pasolini's neighbourhood
    'bar-mattina-nuova',
    'grattachecca-lungotevere', // street food only this city has (Josh, 2026-10-27)
    'bar-monti-corner', // Sandro, back from roma.ts (Josh, 2026-10-27)
    'volpetti-testaccio', // a deli for the city's own food (Josh, 2026-10-27)
    'forno-trastevere', // Dario, back from roma.ts, in place of Pizzeria Da Gigi
    'sapienza-scalinata', // Giorgia, moved from Da Gigi
    'trattoria-garbatella', // Osteria da Nino
    'pantheon-rotonda',
    'gesu-piazza',
    'piazza-navona', // art: Tommaso, from roma.ts (Josh, 2026-11-03)
    'piazza-santa-maria-trastevere', // traditions: Gina, from roma.ts
    'basilica-santa-maria', // art and history: Don Paolo, from roma.ts
    'colosseo', // history: Serena, archaeologist (new)
    'villa-borghese-nuova',
    'tram-porta-maggiore',
    'stazione-termini-nuova',
    // Dialogue variety (Josh, 2026-11-06): generic businesses out
    'farmacia-prati', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
  ],
  matera: [
    'caffe-schiuma',
    'mercato-piccianello',
    'ristorante-francesca',
    'piazza-vittorio',
    'bottega-artigiana',
    'piazza-duomo', // M2: bench character Alberto (pensionato)
    'stazione-fal', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'casa-grotta',
    'sassi-belvedere',
    'parco-murgia',
    'libreria-matera', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
  ],
  firenze: [
    // Today's Florence (Josh, 2026-10-23): real places, everyday people
    'ditta-artigianale-nuova',
    'lampredotto-pollini',
    'trattoria-mario-nuova',
    'santo-spirito-scalini',
    'santa-croce-piazza',
    'parco-cascine',
    'tram-alamanni',
    'stazione-smn-nuova',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'giardino-boboli',
    'piazza-signoria',
    'ponte-vecchio',
    'tabaccheria-nesi', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
  ],
  siena: [
    'pasticceria-bini', // a pastry shop with the city's own specialty, back (Josh, 2026-10-27)
    'pizzicheria-de-miccoli', // a deli for the city's own food (Josh, 2026-10-27)
    'mercato-della-terra',
    'osteria-le-logge',
    'bar-il-palio',
    'piazza-del-campo',
    'bottega-del-palio',
    'piazza-salimbeni', // M2: bench character Beatrice (studentessa)
    'stazione-siena', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'orto-de-pecci',
    'torre-del-mangia',
  ],
  venezia: [
    'bar-al-timon',
    'mercato-rialto',
    'ristorante-antiche-carampane',
    'caffe-florian',
    'campo-santa-margherita',
    'squero-san-trovaso',
    'libreria-acqua-alta',
    'campo-dei-mori', // M2: bench character Dante (storico locale)
    'stazione-santa-lucia', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'ponte-rialto',
  ],
  napoli: [
    'bar-nilo',
    'pizza-a-portafoglio-tribunali', // street food only this city has (Josh, 2026-10-27)
    'pasticceria-poppella', // a pastry shop with the city's own specialty, back (Josh, 2026-10-27)
    'mozzarella-spaccanapoli', // a deli for the city's own food (Josh, 2026-10-27)
    'mercato-pignasecca',
    'pizzeria-sorbillo',
    'caffe-gambrinus',
    'gay-odin',
    'piazza-bellini',
    'spaccanapoli-street', // M2: bench character Nonna Assunta (Via Spaccanapoli) (abitante del quartiere)
    'stazione-centrale-napoli', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'presepi-san-gregorio',
    'castel-ovo',
  ],
  bologna: [
    'caffe-terzi',
    'portici-san-luca', // city pass 2026-11-05: replaces Mercato di Mezzo (a second mortadella seller)
    'sfoglia-rina', // city pass: replaces Bar Senza Nome (a generic student bar)
    'sorbetteria-castiglione', // city pass: replaces Cremeria Funivia (Josh's photo, 2026-11-05)
    'santo-stefano', // city pass: replaces the pharmacy
    'piazza-maggiore',
    'salumeria-simoni',
    'piazza-verdi', // M2: bench character Clara (studentessa)
    'stazione-centrale', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'due-torri',
    'archiginnasio',
    'ristorante-pappagallo', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
  ],
  palermo: [
    'bar-alba',
    'pani-ca-meusa-ballaro', // street food only this city has (Josh, 2026-10-27)
    'mercato-ballaro',
    'trattoria-ai-cascinari',
    'piazza-pretoria',
    'giardino-garibaldi',
    'stazione-centrale-palermo', // M2: train station for travel
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'cappella-palatina',
    'teatro-massimo',
    'quattro-canti',
    'libreria-del-mare', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
    'osteria-ballarò', // kept: it hosts a cultural lesson (Josh, 2026-11-06: "leave them")
  ],
  // Not on the first screen of the city list: reached through "Mostra altro" or
  // the station (Josh, 2026-10-14). 10 places each, same mix, plus the station
  // and language school where the city has them.
  taormina: [
    'bar-turrisi',
    'pasticceria-etna', // a pastry shop with the city's own specialty, back (Josh, 2026-10-27)
    'mercato-giardini',
    'ristorante-baronessa',
    'caffe-wunderbar',
    'piazza-ix-aprile',
    'stazione-taormina-giardini', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'teatro-greco',
    'villa-comunale-taormina',
    'terrazza-panoramica',
  ],
  lecce: [
    'caffe-alvino',
    'mercato-comunale',
    'alle-due-corti',
    'piazza-santoronzo',
    'bottega-cartapesta',
    'stazione-lecce',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'basilica-santa-croce-lecce',
    'museo-faggiano',
    'anfiteatro-romano',
    'rusticceria-santa-croce', // a shop: 5 Beginner openings, none started selling (2026-11-06)
  ],
  milano: [
    'pasticceria-marchesi',
    'mercato-di-porta-romana',
    'trattoria-masuelli',
    'bar-rita',
    'piazza-santo-stefano',
    'peck',
    'stazione-porta-garibaldi',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'duomo-milano',
    'galleria-vittorio-emanuele',
  ],
  verona: [
    'caffe-wallner',
    'mercato-piazza-erbe',
    'ristorante-dodici-apostoli',
    'piazza-bra',
    'salumeria-albertini',
    'stazione-porta-nuova',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'arena-verona',
    'teatro-romano',
    'piazza-signori',
  ],
  assisi: [
    'caffe-duomo',
    'mercato-coperto',
    'ristorante-metastasio',
    'piazza-comune',
    'stazione-assisi', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'basilica-san-francesco',
    'eremo-carceri',
    'rocca-maggiore',
    'piazza-san-rufino',
    'laboratorio-ceramiche', // a shop: 5 Beginner openings, none started selling (2026-11-06)
  ],
  bergamo: [
    'caffe-del-tasso',
    'mercato-citta-alta',
    'ristorante-da-vittorio',
    'piazza-vecchia',
    'libreria-sant-agostino',
    'parco-della-trucca',
    'stazione-bergamo', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'funicolare-bergamo-alta',
    'cappella-colleoni',
    'teatro-donizetti',
  ],
  torino: [
    'caffe-san-carlo',
    'mercato-porta-palazzo',
    'ristorante-del-cambio',
    'bicerin-dal-1763',
    'guido-gobino',
    'piazza-castello',
    'casa-del-vermouth',
    'libreria-luxemburg',
    'stazione-porta-nuova-torino', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'mole-antonelliana',
    'parco-valentino',
  ],
  siracusa: [
    'bar-dolce-vita',
    'caseificio-borderi', // a deli for the city's own food (Josh, 2026-10-27)
    'mercato-ortigia',
    'ristorante-dioniso',
    'piazza-archimede',
    'laboratorio-papiro',
    'stazione-siracusa',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'antica-giudecca',
    'fonte-aretusa',
    'parco-archeologico',
  ],
  genova: [
    'pasticceria-liquorosa', // a pastry shop with the city's own specialty, back (Josh, 2026-10-27)
    'mercato-orientale',
    'trattoria-rosmarino',
    'bar-boccadasse',
    'piazza-ferrari',
    'salumeria-fontana',
    'stazione-principe',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'piazza-boccadasse',
    'lanterna',
    'via-garibaldi',
  ],
  lucca: [
    'caffe-di-simo',
    'mercato-del-carmine',
    'ristorante-giglio',
    'piazza-anfiteatro',
    'gastronomia-angeli',
    'stazione-lucca', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'torre-guinigi',
    'duomo-san-martino',
    'piazza-san-michele',
    'orto-botanico',
  ],
  orvieto: [
    'caffe-montanucci',
    'mercato-coperto-orvieto',
    'ristorante-la-grotta',
    'piazza-del-popolo',
    'bottega-michelangeli',
    'giardini-pubblici',
    'stazione-orvieto', // station (2026-10-14)
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'pozzo-san-patrizio',
    'duomo-orvieto',
    'teatro-mancinelli',
  ],
  mantova: [
    'caffe-modi',
    'mercato-erbe-mantova',
    'ristorante-cigno',
    'gelateria-ducale',
    'piazza-sordello',
    'salumeria-ducale',
    'stazione-mantova',
    // Dialogue variety (Josh, 2026-11-06; docs/conversation-variety.md): the city's own places in, generic businesses out
    'palazzo-te',
    'palazzo-ducale-mantova',
    'parco-te',
  ],
};

/** On the first screen of the city list, in this order; the rest come after "Mostra altro" */
export const homeCities = ['roma-nuova', 'matera', 'firenze', 'siena', 'venezia', 'napoli', 'bologna', 'palermo'];

/**
 * Hidden for now, not deleted (Josh, 2026-10-22: "hide old Rome for now,
 * don't lose it"): the original Roma's shown places, while Roma nuova was
 * tried (docs/rome-redo.md). Retired 2026-11-03 (Josh: "nuova rome is the
 * only rome"); Sandro, Dario, Tommaso, Gina and Don Paolo moved to Roma nuova
 * with their ids. roma.ts removed 2026-11-07 (Josh); its conversations and
 * memories stay in the database, unread by the game.
 */
export const hiddenForNow: Record<string, string[]> = {
  firenze: [ // replaced 2026-10-23
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
    'stazione-smn', // M2: train station for travel
  ],
};
