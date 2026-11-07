import { CityPantry } from '@/lib/types';

/**
 * Roma, redone (docs/rome-redo.md, Josh 2026-10-22): today's Rome, not a
 * tourist trip. A second Rome beside the original so both can be played and
 * compared; the original roma.ts is untouched. Places and people chosen with
 * Josh; scenes, roles, personalities and portraits generated from one dated
 * instruction (not hand-written). Ids are new, so memory starts fresh.
 * Place images use this city's style in generation.json → placeStyles.
 */
export const romaNuova: CityPantry = {
  id: 'roma-nuova',
  name: 'Roma',
  region: 'Lazio',
  neighbourhoods: ['Testaccio', 'San Lorenzo', 'Garbatella', 'Centro Storico', 'Pinciano', 'Porta Maggiore', 'Pigneto', 'Prati', 'Esquilino', 'Trastevere', 'Monti'],

  places: [
    {
      id: 'cinema-pigneto',
      name: 'Cinema Pigneto',
      kind: 'cinema',
      neighbourhood: 'Pigneto',
      real: false,
      imagePrompt: "A small single-screen neighbourhood cinema on Via del Pigneto in Rome in the early evening: the pedestrian street of low two- and three-storey buildings, bright murals on the walls, little bars with tables outside, string lights. An old marquee over the cinema door, film posters in glass cases on either side, a few people queuing with phones. The sign over the door reads \"Cinema Pigneto\" and that is the only lettering in the picture: the posters and murals have no readable words, no titles or prices. Contemporary clothes and objects.",
    },
    {
      id: 'bar-mattina-nuova',
      name: 'Bar Mattina',
      kind: 'bar',
      neighbourhood: 'Testaccio',
      real: false,
      characterId: 'luisa-cocco-nuova',
      imagePrompt: 'A small corner bar in Testaccio in the morning rush, with a zinc counter, a hissing espresso machine and regulars standing shoulder to shoulder with cups and cornetti. Luisa works behind the counter, setting down cups before people have finished ordering.',
    },
    {
      id: 'pizza-taglio-san-lorenzo',
      name: 'Pizzeria Da Gigi',
      kind: 'pizza-al-taglio',
      neighbourhood: 'San Lorenzo',
      real: false,
      hidden: true, // Giorgia moved to the Sapienza steps (Josh, 2026-10-27)
      imagePrompt: 'A narrow pizza al taglio shop in San Lorenzo, with trays of rectangular pizza behind a glass counter and a few students eating on stools by the window. Giorgia stands at the counter between lectures, waiting for her usual slice to be weighed.',
    },
    {
      id: 'trattoria-garbatella',
      name: 'Osteria da Nino',
      kind: 'osteria',
      neighbourhood: 'Garbatella',
      real: false,
      characterId: 'nino-garbatella',
      imagePrompt: "A wooden A-frame sandwich board standing on the cobbles outside Osteria da Nino in Garbatella, seen straight on and close, filling most of the picture from top to bottom. Its dark-green chalkboard face is completely blank, clean and flat, square to the viewer, with a plain wooden frame. Behind it, a little out of focus, a Roman street at lunchtime: ochre and terracotta houses, the osteria's open door with tables outside, a Vespa, a few people.",
      menu: ['Carciofi alla romana', 'Cacio e pepe', 'Gricia', 'Amatriciana', 'Carbonara', 'Giovedì: gnocchi'],
      // The sandwich board's chalk face in the feed picture, where the app writes the menu
      menuBoard: { x: 0.33, y: 0.29, width: 0.34, height: 0.5 },
      pictures: [
              {
                      "id": "osteria-da-nino-carciofi-alla-romana",
                      "shows": "carciofi alla romana",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of two Roman artichokes braised whole with mint and garlic, stems up, glistening with olive oil, on a white plate, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-cacio-e-pepe",
                      "shows": "cacio e pepe",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of a plate of tonnarelli cacio e pepe, creamy with pecorino and flecked with black pepper, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-gricia",
                      "shows": "gricia",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of a plate of rigatoni alla gricia with crisp cubes of guanciale and grated pecorino, no tomato, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-amatriciana",
                      "shows": "amatriciana",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of a plate of bucatini all'amatriciana (bucatini: long thick pasta tubes like drinking straws, the hollow open ends clearly visible on a few strands, much thicker than spaghetti) in a red tomato sauce with guanciale and pecorino, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-carbonara",
                      "shows": "carbonara",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of a plate of spaghetti alla carbonara, glossy and golden from egg and pecorino mixed through the pasta, crisp guanciale and black pepper, no raw yolk on top, no cream, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-gnocchi",
                      "shows": "gnocchi",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. A close-up of a plate of potato gnocchi in tomato sauce with grated cheese, the Thursday dish, on a table with a white paper tablecloth, a fork and a glass of water beside it, in a small osteria. No people, no lettering anywhere in the picture."
              },
              {
                      "id": "osteria-da-nino-room",
                      "shows": "the room",
                      "imagePrompt": "Warm ochre and terracotta watercolor with ink, like Rome's other place pictures. Inside a small old osteria in Garbatella: a low ceiling, white walls with a few framed photos, shared wooden tables with white paper tablecloths, carafes of water and glasses, a counter with a till at the back and a doorway to the kitchen. A few locals eat at lunchtime. No lettering anywhere in the picture."
              }
      ],
    },
    {
      id: 'pantheon-rotonda',
      name: 'Pantheon',
      kind: 'landmark',
      neighbourhood: 'Centro Storico',
      real: true,
      characterId: 'matteo-rinaldi',
      imagePrompt: 'The fountain steps in Piazza della Rotonda, the baroque fountain in the middle of the square topped by a short Egyptian obelisk, only about twice the height of a person, well below the height of the Pantheon portico, with the Pantheon\'s columns and great bronze doors behind and tall palazzi around the piazza, and tourists and pigeons crossing the square on an October weekday. Matteo sits on the edge of the fountain with a sketchbook on his knee, drawing the portico between tours.',
    },
    {
      id: 'gesu-piazza',
      name: 'Il Gesù',
      kind: 'church',
      neighbourhood: 'Centro Storico',
      real: true,
      characterId: 'franca-mattei',
      imagePrompt: 'The Baroque church of Il Gesù seen from its piazza in the historic centre: the tall, pale travertine facade with paired pilasters, a triangular pediment and a heavy central doorway at the top of a few shallow steps, flanked by dark palazzi and cobbled stones in the foreground, with a busy street edge, a few pedestrians and a bright, slightly hazy autumn sky above. Franca Mattei, an elderly retired schoolteacher in a light coat with a handbag over her arm, stands on the steps just outside the great doors, looking out across the piazza.',
    },
    {
      id: 'villa-borghese-nuova',
      name: 'Villa Borghese',
      kind: 'park',
      neighbourhood: 'Pinciano',
      real: true,
      characterId: 'ettore-gentili-nuova',
      imagePrompt: 'A gravel path under tall umbrella pines in Villa Borghese on a mild October morning, with joggers, dog walkers and fallen leaves along the way. Ettore walks the path at a steady pace.',
    },
    {
      id: 'tram-porta-maggiore',
      name: 'Fermata del tram, Porta Maggiore',
      kind: 'tram-stop',
      neighbourhood: 'Porta Maggiore',
      real: true,
      characterId: 'daniele-sorrentino',
      imagePrompt: 'A tram stop at Porta Maggiore on a weekday morning: the huge travertine arches of the ancient aqueduct gate behind, umbrella pines beyond it, a tangle of tram wires and rails crossing in front of it, an orange tram arriving, traffic circling and commuters waiting on the platform. Daniele stands at the edge of the platform, looking down the tracks for the tram.',
    },
    {
      id: 'tabaccheria-pigneto',
      name: 'Tabaccheria Zhou',
      kind: 'tabaccheria',
      neighbourhood: 'Pigneto',
      real: false,
      characterId: 'marco-zhou',
      imagePrompt: 'On a quiet weekday morning in Pigneto, the street-level tabaccheria sits in a continuous row of tall, weathered apartment buildings, its glass front and open door beneath several storeys of shuttered windows and small balconies, with neighbouring shopfronts on either side and a pale autumn sky above. Marco Zhou, the tabaccaio, stands in the doorway with his arms folded, looking out at the street.',
    },
    {
      id: 'farmacia-prati',
      name: 'Farmacia Prati',
      kind: 'pharmacy',
      neighbourhood: 'Prati',
      real: false,
      characterId: 'silvia-bruni-nuova',
      imagePrompt: 'A pharmacy on a broad, tree-lined street in Prati, seen from the pavement across the way: a stone-faced early-twentieth-century building with tall shuttered windows above, a glass-fronted shopfront below with an illuminated green cross jutting out over the entrance, and plane trees casting dappled shade under a clear October sky. Dott.ssa Silvia Bruni, a woman in a white coat, stands in the open doorway with one hand on the door frame, glancing up the street while a scooter and a couple of passers-by go by.',
    },
    {
      id: 'stazione-termini-nuova',
      name: 'Stazione Termini',
      kind: 'train-station',
      neighbourhood: 'Esquilino',
      real: true,
      characterId: 'pietro-termini-nuova',
      imagePrompt: 'The big modern hall of Stazione Termini, the long 1950s front of glass and travertine under its low wavy concrete canopy, travellers crossing under the departures board with suitcases, a line at the ticket machines and the ticket office windows behind. Pietro serves a traveller at a ticket window.',
    },
    // Brought back from roma.ts with their art (Josh, 2026-10-27: "add back the
    // pizza guy", "I miss the big old guy at the bar"); same ids, so the same
    // pictures and the same memory of the learner
    {
      id: 'bar-monti-corner',
      name: 'Bar Angolo',
      kind: 'bar',
      neighbourhood: 'Monti',
      real: false,
      characterId: 'sandro-bar-angolo',
      imagePrompt: 'a small corner bar on a sloping cobbled street in Monti, zinc counter, chrome espresso machine, a glass case of cornetti, two locals chatting at the counter, the faded orange palazzi of the quarter climbing the hill behind, soft morning light.',
    },
    {
      id: 'forno-trastevere',
      name: 'Forno in Trastevere',
      kind: 'bakery',
      neighbourhood: 'Trastevere',
      real: false,
      characterId: 'dario-fornaio',
      imagePrompt: 'a small bakery on a narrow street in Trastevere with a wood-fired oven glowing at the back, long trays of pizza bianca and pizza rossa sold by weight, the baker in a white apron cutting a slice, paper-wrapped slices on the counter and a queue of locals at the door.',
    },
    // Brought over from roma.ts (Josh, 2026-11-03: Roma nuova is the only
    // Rome; open places with someone who cares about the city's art, history
    // and traditions). Same ids, so the same portraits and memory; scenes
    // rewritten for this city's style. The Colosseo has a new person: the
    // old one was a tour guide, which the redo moved away from.
    {
      id: 'piazza-navona',
      name: 'Piazza Navona',
      kind: 'piazza',
      neighbourhood: 'Centro Storico',
      real: true,
      characterId: 'tommaso-pittore',
      imagePrompt: "Piazza Navona on a weekday afternoon: the long oval of ochre and pink palazzi, Bernini's Fountain of the Four Rivers with its obelisk in the middle, the curved front and dome of Sant'Agnese in Agone behind it, Romans crossing the square on foot on their way somewhere, a few café tables at the edge and a short row of painters' easels. A pedestrian square: no cars, buses, taxis or scooters anywhere in the piazza. Tommaso stands at his easel near the fountain, brush in hand.",
    },
    {
      id: 'piazza-santa-maria-trastevere',
      name: 'Piazza Santa Maria in Trastevere',
      kind: 'piazza',
      neighbourhood: 'Trastevere',
      real: true,
      characterId: 'nonna-gina',
      imagePrompt: 'The Piazza di Santa Maria in Trastevere on an ordinary afternoon: the old fountain in the middle with people sitting on its steps, ochre and orange houses with green shutters all round the square, and on one side the basilica of Santa Maria in Trastevere: a plain Romanesque front with a band of gold mosaics of the Madonna across the top, a portico below, and a tall brick bell tower. Children running, neighbours talking, a man walking a dog. A pedestrian square: no cars, buses, taxis or scooters. Gina sits on the fountain steps with her shopping bag beside her, talking to whoever sits down.',
    },
    {
      id: 'basilica-santa-maria',
      name: 'Basilica di Santa Maria in Trastevere',
      kind: 'church',
      neighbourhood: 'Trastevere',
      real: true,
      characterId: 'don-paolo',
      imagePrompt: 'The front of the Basilica di Santa Maria in Trastevere close up: a portico of columns at street level, a band of gold mosaic figures glowing across the top of the facade, the tall Romanesque brick bell tower beside it, people going in and out of the open doors. Don Paolo stands under the portico by the door, greeting someone.',
    },
    {
      id: 'colosseo',
      name: 'Colosseo',
      kind: 'landmark',
      neighbourhood: 'Monti',
      real: true,
      characterId: 'serena-archeologa',
      imagePrompt: 'The Colosseum seen from the slope of the Colle Oppio on a weekday: the tall travertine arches, the outer ring broken away on one side, umbrella pines on the slope, traffic and buses passing below, crowds and school groups small in the distance at the entrance. Serena sits on a low wall in the foreground with a sandwich and an open notebook of drawings, looking at the arches.',
    },
    {
      id: 'sapienza-scalinata',
      name: 'La Sapienza',
      kind: 'university',
      neighbourhood: 'San Lorenzo',
      real: true,
      characterId: 'giorgia-ferri',
      imagePrompt: 'The wide stone steps in front of the main building of La Sapienza university in Rome, a 1930s travertine facade with no lettering on it and the statue of Minerva, students sitting on the steps with books, slices of pizza and coffee on a sunny October afternoon. Giorgia sits on the steps with a canvas tote full of books and a slice of pizza.',
    },
    // A deli for this city's own food (Josh, 2026-10-27: "make the delis")
    {
      id: 'volpetti-testaccio',
      name: 'Volpetti',
      kind: 'deli',
      neighbourhood: 'Testaccio',
      real: true,
      characterId: 'claudio-salumiere',
      imagePrompt: 'The counter of a famous old deli on Via Marmorata in Testaccio: hams and salami hanging from the ceiling, wheels of pecorino romano stacked high, a whole porchetta on the counter being sliced, jars of truffles and olive oil on the shelves, a customer tasting a sliver of cheese.',
    },
    // Street food only this city has (Josh, 2026-10-27)
    {
      id: 'grattachecca-lungotevere',
      name: 'Chiosco della grattachecca',
      kind: 'kiosk',
      neighbourhood: 'Trastevere',
      real: false,
      characterId: 'mirella-grattachecca',
      imagePrompt: 'An old green kiosk on the Lungotevere by the Tiber in Trastevere on a hot evening: a big block of ice being shaved by hand with a metal scraper into a glass, bottles of coloured syrups (tamarind, mint, lemon, cherry) on the counter, fresh fruit, people waiting under the plane trees with the river behind.',
    },
  ],

  characters: [
    {
      id: 'luisa-cocco-nuova',
      name: 'Luisa Cocco',
      gender: 'f',
      age: 39,
      voice: 'ZPImQHFNyEPRDeECS4MX', // Vale
      role: 'barista',
      placeId: 'bar-mattina-nuova',
      personality: ["quick", "funny", "attentive"],
      portraitPrompt: 'Pen and ink portrait on white paper of a 39-year-old woman with dark hair pulled back in a loose knot, quick brown eyes and a wide teasing grin, wearing a black apron over a rolled-sleeve white shirt. She is tamping coffee into a portafilter with one hand while sliding a saucer across the counter with the other, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: "You run the counter of a corner bar in Testaccio, the old slaughterhouse district, where regulars stand at the zinc for cappuccino and cornetto in the morning and switch to caffè after 11. Here people pay at the cassa first: whoever comes to your counter has already paid and hands you the scontrino, so you never send them to pay; you take it and make what they paid for.",
    },
    {
      id: 'giorgia-ferri',
      name: 'Giorgia Ferri',
      gender: 'f',
      age: 23,
      voice: 'zFA34HbdHBvF8WhlSusK', // Nora
      role: 'studentessa',
      placeId: 'sapienza-scalinata',
      personality: ['curious', 'easygoing', 'chatty'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 23-year-old woman with wavy chestnut hair, a denim jacket over a sweater and a canvas tote full of books on her shoulder, looking relaxed and a little tired. She is holding a slice of pizza in paper and a phone with her other hand, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: "You study at La Sapienza and sit on the steps of the Rettorato between lectures, with a slice of pizza and your books. You love the history of your neighbourhood, San Lorenzo, and of Rome in the last century (the plaques for the bombing of July 1943, the first on Rome in the war, are on walls you pass every day). When someone sits near you on the steps, you get talking about it.",
    },
    {
      id: 'mohamed-hassan',
      name: 'Mohamed Hassan',
      gender: 'm',
      age: 41,
      voice: 'mcMi8FJDhg35bMpWHv2R', // Paolo
      role: 'cameriere',
      placeId: 'trattoria-garbatella',
      personality: ['opinionated', 'warm', 'proud'],
      portraitPrompt: 'Pen and ink portrait on white paper, washed with warm Roman ochre and terracotta watercolor like the other portraits, of a 41-year-old Egyptian-born man with short dark hair, a trimmed beard going slightly grey and a knowing half-smile, wearing a light blue shirt with sleeves rolled up and a long olive-green apron. He is carrying two plates of pasta and glancing over his shoulder as if about to share an opinion about last night\'s match; detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You wait tables at a neighbourhood trattoria in Garbatella that cooks Rome's classics: carbonara, cacio e pepe, amatriciana, saltimbocca, and gnocchi on Thursdays as in every Roman trattoria. You came from Egypt and now argue about carbonara like a Roman.",
    },
    {
      id: 'nino-garbatella',
      name: 'Nino Ferretti',
      gender: 'm',
      age: 74,
      voice: 'OcIrXHpOMgy1jqfJ2I8o', // Criss
      role: 'oste',
      placeId: 'trattoria-garbatella',
      personality: ['talkative', 'proud', 'teasing', 'generous'],
      portraitPrompt: "Pen and ink portrait on white paper, washed with warm Roman ochre and terracotta watercolor like the other portraits, of a 74-year-old Roman man with thin white hair combed back, a broad face, bushy grey eyebrows and a big smile, wearing a brown cardigan over a checked shirt. He sits at a small table with his hands open mid-sentence, as if telling someone how a dish should be made; detailed crosshatching, no lettering anywhere in the picture. The subject is a man.",
      here: "You are Nino, who opened this osteria in Garbatella in the 1970s and gave it your name. Your son Marco runs the kitchen now. It is the quiet hour after lunch: the kitchen is closed until dinner at half past seven, nobody is taking orders, and you sit at your table by the door with a coffee, next to the board. You would rather talk about food than anything, and a newcomer who stops is someone to tell about your menu, dish by dish: what is in it, where it comes from, how your mother made it, what the tourists get wrong. You want to know what they have eaten in Rome and whether they have had a real carbonara. Anyone who wants to eat comes back for dinner, and pays at the counter. On the board by the door: carciofi alla romana, cacio e pepe, gricia, amatriciana, carbonara, and gnocchi on Thursdays. Gricia is guanciale and pecorino; add tomato and it is amatriciana; add egg yolks instead and it is carbonara, never cream. Cacio e pepe is pecorino, black pepper and the starchy pasta water, stirred until creamy. The artichokes are braised with garlic and mint. Gnocchi on Thursday is an old Roman habit.",
    },
    {
      id: 'matteo-rinaldi',
      name: 'Matteo Rinaldi',
      gender: 'm',
      age: 31,
      voice: 'DTGwzA4YLrWB1FAT6Uas', // Lorenzo
      role: 'studente di storia antica e guida turistica',
      placeId: 'pantheon-rotonda',
      personality: ['laid-back', 'bookish', 'friendly'],
      portraitPrompt: "Pen and ink portrait on white paper of a 31-year-old man with short dark hair, stubble and round glasses, in a worn corduroy jacket over a sweater, a sketchbook open on his knee and a pencil in his hand, looking up mid-thought as if about to explain something, minimal watercolor wash in warm Roman ochre and terracotta tones, delicate linework",
      here: "You study classical history at La Sapienza and give tours part time; between tours you sit on the fountain steps sketching the Pantheon's portico. Every year at Pentecost, at the end of the morning Mass, Rome's firefighters drop thousands of red rose petals through the oculus, for the Holy Spirit coming down, and you never miss it. When someone sits near you, you get talking about the Pantheon and its traditions.",
    },
    {
      id: 'franca-mattei',
      name: 'Franca Mattei',
      gender: 'f',
      age: 67,
      voice: 'MLpDWJvrjFIdb63xbJp8', // Angelina
      role: 'maestra in pensione',
      placeId: 'gesu-piazza',
      personality: ['kind', 'precise', 'curious'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 67-year-old woman with short silver hair, round glasses and a calm, attentive face, wearing a camel coat, a silk scarf and flat leather shoes. She is holding a worn leather handbag and a folded newspaper under her arm, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: "You are a volunteer at Il Gesù, the mother church of the Jesuits, in Rome's Centro Storico. Its ceiling, painted by Baciccio in the late 1600s, is a fresco in which the figures seem to spill out of the frame into the nave. The church holds the tomb of Saint Ignatius of Loyola, the order's founder. Entry is free, and nobody is expected to buy anything.",
    },
    {
      id: 'ettore-gentili-nuova',
      name: 'Ettore Gentili',
      gender: 'm',
      age: 78,
      voice: 'w3aQQZqtgGo2o2fsmvQ2', // Nonno Ben
      role: 'pensionato',
      placeId: 'villa-borghese-nuova',
      personality: ['gentle', 'talkative', 'nostalgic'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 78-year-old man with thinning white hair, a deeply lined, cheerful face and a straight back, wearing a tweed cap, a green jacket and polished brown shoes. He is walking with a wooden cane in one hand and lifting the other to greet someone, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You've sat on the same bench by the lake in Villa Borghese every morning since you retired. You're a lifelong reader of Rome's history and legends, from the ancient city to the papal one, the kind of thing Romans tell each other (the talking statue of Pasquino, where Romans pinned anonymous satire against the popes, is a favourite of yours). When someone sits down on your bench, you get talking about it.",
    },
    {
      id: 'daniele-sorrentino',
      name: 'Daniele Sorrentino',
      gender: 'm',
      age: 28,
      voice: 'o4b57JYAECRMJyCEXyIE', // Brando Vox
      role: 'tecnico del suono',
      placeId: 'tram-porta-maggiore',
      personality: ['calm', 'dry-humoured', 'punctual'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 28-year-old man with a short beard, messy dark hair and headphones around his neck, wearing a black jacket and jeans, with a slightly sleepy but good-natured expression. He is carrying a heavy black equipment case on a strap and checking his phone, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You set up the sound for Rome's concerts in its piazzas, and you wait at this stop for the tram to the halls and squares where you work. You love Rome's music, from the old stornelli romani to the songs Romans still sing together (Antonello Venditti's Roma capoccia is the one that always gets you singing). When someone waits with you, you get talking about it.",
    },
    {
      id: 'marco-zhou',
      name: 'Marco Zhou',
      gender: 'm',
      age: 31,
      voice: 'MTgv1KRJpUnc34UMGTHK', // Matteo
      role: 'tabaccaio',
      placeId: 'tabaccheria-pigneto',
      personality: ["dependable", "witty", "hardworking"],
      portraitPrompt: 'Pen and ink portrait on white paper of a 31-year-old Chinese-Italian man, born and raised in Rome, with neat black hair and glasses, wearing a grey cardigan over a collared shirt, with a friendly, slightly tired smile. He is handing a bus ticket and change across the counter and speaking in a Roman accent, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You sell bus tickets, stamps and lottery tickets in Pigneto, the old working-class neighbourhood where Pasolini filmed. Your parents came from China, but you speak pure Roman, and you're Pigneto through and through: the centro is for tourists, the real Rome is out here. Customers who play the Lotto tell you their dreams, and you help them turn them into numbers with la smorfia, the old Neapolitan book of dream numbers, where 90 is la paura, fear.",
    },
    {
      id: 'silvia-bruni-nuova',
      name: 'Dott.ssa Silvia Bruni',
      gender: 'f',
      age: 47,
      voice: '201hPjDVu4Q5DUV7tMQJ', // Marcella
      role: 'farmacista',
      placeId: 'farmacia-prati',
      personality: ["patient", "precise", "reassuring"],
      portraitPrompt: 'Pen and ink portrait on white paper of a 47-year-old woman with a sleek dark bob, thin-framed glasses and a calm, attentive expression, wearing a white coat over a navy blouse. She is holding a prescription in one hand and a small box of medicine in the other, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: "You run a pharmacy in Prati, beside the Vatican. Until Rome became Italy's capital in 1871 this was open meadow below Castel Sant'Angelo, the Prati di Castello. The new district was built for the new state, with a grid of straight streets and squares named after heroes of Italian unification like Cavour and Mazzini. In every Holy Year pilgrims pour through on their way to St Peter's. People come to you with a ricetta or to ask what to take for a cold.",
    },
    {
      id: 'pietro-termini-nuova',
      name: 'Pietro Lombardi',
      gender: 'm',
      age: 55,
      voice: 'PSp7S6ST9fDNXDwEzX0m', // Alessandro
      role: 'bigliettaio',
      placeId: 'stazione-termini-nuova',
      personality: ["methodical", "tired but kind", "patient"],
      portraitPrompt: 'Pen and ink portrait on white paper of a ticket office clerk in his fifties with greying hair, a navy railway uniform and tie, leaning toward a ticket window, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You sell train tickets at Termini, Rome's main station, and help lost newcomers choose between a regional train and a fast one. A paper regional ticket must be validated at a machine before boarding. The station is named after the nearby Baths of Diocletian, the terme. On Pasquetta, Easter Monday, Romans picnic in the countryside and the Castelli Romani, and around Ferragosto, 15 August, half the city empties for the sea.",
    },
    {
      id: 'sandro-bar-angolo',
      name: 'Sandro Pieri',
      gender: 'm',
      age: 61,
      voice: 'w3aQQZqtgGo2o2fsmvQ2', // Nonno Ben
      role: 'barista',
      placeId: 'bar-monti-corner',
      personality: ["gruff", "loyal", "dry humour"],
      portraitPrompt: 'Pen and ink portrait on white paper of an older Roman barista with a bald head, thick grey moustache, rolled shirtsleeves and a striped apron, wiping the zinc counter, half a smile, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching. The subject is a man.',
      here: "You've run the zinc counter of this corner bar in Monti for thirty years and know every regular's coffee (caffè, macchiato, al vetro); you grumble, kindly, at anyone ordering a cappuccino after lunch. Here people pay at the cassa first: whoever comes to your counter has already paid and hands you the scontrino, so you never send them to pay; you take it and make what they paid for.",
    },
    {
      id: 'dario-fornaio',
      name: 'Dario Ferri',
      gender: 'm',
      age: 34,
      voice: 'DTGwzA4YLrWB1FAT6Uas', // Lorenzo
      role: 'fornaio',
      placeId: 'forno-trastevere',
      personality: ["early riser", "shy", "proud of his pizza bianca"],
      portraitPrompt: 'Pen and ink portrait on white paper of a young baker in his thirties with curly dark hair dusted with flour, short beard, white t-shirt and apron, holding a long tray of pizza bianca, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching. The subject is a man.',
      here: "You bake pizza bianca and pizza rossa in the wood oven before dawn and sell it by weight, cut with scissors; Romans eat it warm on the way to work, sometimes filled with mortadella.",
    },
    // From roma.ts, 2026-11-03 (see the places above)
    {
      id: 'tommaso-pittore',
      name: 'Tommaso Ricci',
      gender: 'm',
      age: 45,
      voice: 'mcMi8FJDhg35bMpWHv2R', // Paolo
      role: 'pittore di strada',
      placeId: 'piazza-navona',
      personality: ['dreamy', 'charming', 'easily distracted'],
      portraitPrompt: 'Pen and ink portrait on white paper of a street painter in his forties with long greying hair tied back, paint-stained linen shirt, holding a brush in front of an easel, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching. The subject is a man.',
      here: "You paint at your easel in Piazza Navona, whose long oval follows the shape of the Stadium of Domitian that once stood here. At the centre is Bernini's Fountain of the Four Rivers, and Borromini's church of Sant'Agnese in Agone faces it across the square. Romans say the river god shields his eyes or raises his hand in fear that the church will fall, but the fountain was finished before the façade, so the tale isn't true. Other painters and stalls fill the square, and at Christmas the Befana market sets up here.",
    },
    {
      id: 'nonna-gina',
      name: 'Gina Proietti',
      gender: 'f',
      age: 81,
      voice: 'MLpDWJvrjFIdb63xbJp8', // Angelina
      role: 'nonna del quartiere',
      placeId: 'piazza-santa-maria-trastevere',
      personality: ['affectionate', 'full of advice'],
      portraitPrompt: 'Pen and ink portrait on white paper of an elderly Roman grandmother with curled white hair, a floral dress and black cardigan, sitting on a fountain step with a shopping bag, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching. The subject is a woman.',
      here: "You were born in Trastevere and sit on the fountain steps most afternoons. You love the folklore and religious traditions of Trastevere and of Rome, and the Roman words that go with them (the Festa de' Noantri in July, when the Madonna del Carmine is carried through these streets, is the one you wait for all year). When someone sits beside you on the steps, you get talking about them.",
    },
    {
      id: 'don-paolo',
      name: 'Don Paolo Severi',
      gender: 'm',
      age: 70,
      voice: 'ipT4u0Omn6M1PjJcECNG', // Giuseppe Galassi
      role: 'parroco',
      placeId: 'basilica-santa-maria',
      personality: ['gentle'],
      portraitPrompt: 'Pen and ink portrait on white paper of an elderly parish priest with thin white hair, kind eyes behind wire glasses, black clerical shirt with white collar, hands folded, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching. The subject is a man.',
      here: "You're the parish priest of Santa Maria in Trastevere, one of the oldest churches in Rome. You love its mosaics and Rome's religious traditions and legends (the old story of a spring of oil that flowed from the ground here, still marked fons olei near the altar). When someone comes in, you're glad to show them around and get talking about it.",
    },
    {
      id: 'serena-archeologa',
      name: 'Serena Lupi',
      gender: 'f',
      age: 36,
      voice: '8KInRSd4DtD5L5gK7itu', // Giusy
      role: 'archeologa',
      placeId: 'colosseo',
      personality: ['precise', 'enthusiastic', 'impatient with gladiator films'],
      portraitPrompt: 'Pen and ink portrait on white paper, washed with warm Roman ochre and terracotta watercolor like the other portraits, of a 36-year-old woman with dark hair cut short, sunglasses pushed up on her head and a sunburnt nose, wearing a rust-red work shirt with rolled sleeves and dusty trousers. She sits on a low wall with a sandwich in one hand and a pencil over an open notebook of drawings in the other, looking up as if about to correct someone; detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: "You're an archaeologist with the Parco archeologico del Colosseo and eat your lunch on a wall on the Colle Oppio, looking at the arches. You love the history of ancient Rome and what's still being found under the modern city (digging for the new Metro C line keeps turning up ancient remains under the city). When someone stops by your wall, you get talking about it.",
    },
    {
      id: 'claudio-salumiere',
      name: 'Claudio Marini',
      gender: 'm',
      age: 52,
      voice: 'f8NAZK1ciwrVujah7clz', // Valerio
      role: 'salumiere',
      placeId: 'volpetti-testaccio',
      personality: ['generous', 'loud', 'loves a tasting'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 52-year-old man with a shaved head, thick forearms and a broad smile, in a white jacket and a burgundy apron, holding out a sliver of pecorino on the tip of a knife, minimal watercolor wash in warm Roman ochre and terracotta tones, detailed crosshatching, no lettering anywhere in the picture. The subject is a man.',
      here: "You work the counter at Volpetti on Via Marmorata, a Testaccio deli since 1973 that sells pecorino romano, guanciale for carbonara, porchetta sliced to order and more. Testaccio grew around Rome's slaughterhouse, and the cuts its workers took home, the quinto quarto, became coda alla vaccinara, trippa and pajata. Roman carbonara is made with guanciale, pecorino romano, eggs and black pepper, never cream.",
    },
    {
      id: 'mirella-grattachecca',
      name: 'Mirella Ceccarelli',
      gender: 'f',
      age: 70,
      voice: 'V4hbKpM9VBIJ9lKaWBjM', // Lea
      role: 'grattacheccara',
      placeId: 'grattachecca-lungotevere',
      personality: ['brisk', 'nostalgic', 'teasing'],
      portraitPrompt: 'Pen and ink portrait on white paper of a 70-year-old Roman woman with short white hair, gold glasses and a sleeveless floral dress, shaving a block of ice with a metal scraper, minimal watercolor wash in warm Roman ochre and terracotta tones with a touch of mint green, detailed crosshatching, no lettering anywhere in the picture. The subject is a woman.',
      here: 'You run a grattachecca kiosk by the Tiber, as your family has for decades: you shave ice by hand from a block into a glass and pour syrup over it, tamarind, mint, lemon or amarena, with fresh fruit; Romans come on hot evenings and argue about the best flavour.',
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
};
