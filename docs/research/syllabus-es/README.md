# Spanish Syllabus Research (Afuera)

2026-10-19 · Josh · The Spanish counterpart of `docs/research/syllabus/`. From sources Josh provided; summaries in our own words, only short everyday phrases quoted. All three sources are from Spain, so every file marks Spain-only usage and gives the Mexican form.

| File | Source | What it is |
|---|---|---|
| `pcic-a1-a2.md` | *Plan Curricular del Instituto Cervantes* (PCIC), the official reference for Spanish levels | What an A1 and A2 learner can do, the function list with frames, grammar by level, B1–B2 headlines, and "For Afuera" (ustedes, usted, Spain/Mexico words by place) |
| `level-words-es.csv` | PCIC topic and general vocabulary, A1–A2 | 1,361 lemmas (`lemma,pos,level,theme,variety`): `es` = Spain-only (59), `am` = PCIC's own Hispanic American mark (10), `mx` = Mexican equivalent added for each Spain-only word (57). The expert-judged list Italian never had |
| `a1-ele-actual.md`, `a1-ele-actual-anki.csv` | *ELE Actual A1* (SM) | 15 lessons by unit; 211 phrase cards in Mexican forms |
| `communicating-in-mexico.md` | *The Seven Keys to Communicating in Mexico* (Georgetown UP, 2020), an intercultural business guide | The seven keys, everyday speech habits (*¿mande?*, *usted*, diminutives, soft refusals), and testable behaviours for Afuera's characters and the judge |
| `mexican-words.md`, `mexican-words.csv` | *Mexican Spanish Word Power 2001* (SpanishPod101) | 1,868 Mexican words by topic (`spanish,english,pos,topic,in_pcic,pcic_level`); 32% are in the PCIC A1–A2 list. Everyday words the PCIC lacks, Spain-flavoured entries flagged, how to level the rest. Rebuild with `scripts/parse_mexican_words.py` |
| `a1-a2-espanol-en-marcha.md`, `a1-a2-espanol-en-marcha-anki.csv` | *Nuevo Español en Marcha Básico* (SGEL, A1–A2; OCR of a scan) | 18 units by unit, A1 through 8, A2 from 10; 270 cards in Mexican forms. Orders breakfast in Unit 3 and a restaurant meal in Unit 5; directions in three steps (6, 8, 14) |

## Notes for Afuera

- **PCIC puts no past tense at A1**; all three pasts are A2. Mexico uses the preterite for the recent past (*hoy comí*), where Spain uses the present perfect.
- **ELE Actual never teaches ordering in a café or directions**, Afuera's first situations.
- **Pronunciation:** the books teach Spain's "th" for *z, ce, ci*; Mexico says *s*. Never treat *s* as an error.
- **The PCIC's topic lists follow central and northern Spain** (it says so); its `am` marks are few. Use the `mx` rows when scoring Mexican characters' lines.
- Parsing caveat: the PCIC text has A1 and A2 side by side; levels were assigned by column position, and a few look odd (*cabeza* A2, *pelo* A1). Not checked against the Cervantes website (blocked here).

## The 10 beginner chips, for Mexico

Same chips as Italy (`tests/experiments/missions-it.json`), checked against these sources:

| Chip | Where taught | Level | Mexico note |
|---|---|---|---|
| Greet and say goodbye | ELE 1, Marcha 1 | A1 | *usted* with strangers and staff |
| Introduce yourself | ELE 1–3, Marcha 1 | A1 | |
| Order food and drink | Marcha 3C (breakfast), 5A (restaurant); not in ELE A1 | A1 | *mesero*, *la cuenta*, *jugo*, *torta*, *¿me da…?* |
| Ask the price and pay | ELE 6, Marcha 9 | A1 | pesos and centavos |
| Buy at the market | Marcha 15C | **A2** | quantities (*medio kilo*); Afuera's cities have no market place yet |
| Ask for directions | Marcha 6A, 8A, 14C; not in ELE A1 | A1 to ask, A2 to understand | *camión* for bus; *cuadra* for block |
| Say what you don't understand | function lists (PCIC) | A1 | *¿Mande?* is the polite Mexican "sorry?" |
| Talk about time | ELE 10, Marcha 6 | A1 | |
| Get around | Marcha 6A | A1 | *metro*, *camión*, *boleto* |
| Make a small plan | ELE 12, Marcha 7 | A1 | *¿Nos vemos a las…?* |

As in Italian, *Buy at the market* is A2. The past (*¿Qué hiciste?*) is A2 in the PCIC and late A1 in both books.
