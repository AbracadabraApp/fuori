# Conversation test

2026-10-17 21:43 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, sometimes ask" · learner taps reply buttons (replies 2026-10-17) · 12 conversations · 6 learner turns each

## Grade: 8.1 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.1 |
| adapts | 7.7 |
| alive | 6.3 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 13 |
| Reply (median words) | 17 |
| Reply (average words) | 16.6 |
| Longest reply (words) | 24 |
| Replies over 30 words | 0% |
| Questions per reply | 0.9 |
| Replies asking 2+ questions | 10% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Nearly every turn ends in a stock choice or yes/no question, so the characters feel like order-taking scripts.** "Acqua frizzante o naturale?", "Preferisci il sole o l'ombra?", "Le piace? Sì o no?"
2. **The characters react with filler and don't build on what the learner said or share anything of their own.** "Che bello, sono contento!", "Ottima scelta", "Bravo, la diavola è piccante!" Only a few real touches show up, like the cheese joke and "meglio per la terra".
3. **They contradict or repeat themselves.** "Il cornetto qui è fresco, di stamattina" at an evening bar, right after "Buonasera". Benedetta says to sit "qui" and then offers a window table or one in back. Giorgio says twice that he works in the park.

Replies are accurate, and 0% go over 30 words. But medians of 14–21 are above the ~10-word norm, because most turns stack praise, a statement and a question.

## Recommendations

1. **Give each character a few concrete details of their own in the character data.** Examples: what's actually in the pot, what they think of the local rival, what's going on today, and one thing in the scene that really exists (a Mexican cookbook on the shelf, the ribollita, a contrada rivalry). This keeps the prompt minimal and describes the situation, not how to talk. It gives the character something to say besides a question, which should reduce the reflexive "X o Y?" and the empty praise.

2. **Add a short recap to the turn prompt in `build-turn-prompt.ts`.** Include what the character has already said and asked, plus the last question's shape, with a light line like "Non ripetere quello che hai già detto." This should stop the park and sun/shade loops without adding rules about style. It also leaves room for a shorter turn: one reaction, then at most one short question.

3. **Pin the physical and time facts in the scenario data.** Include time of day, where the learner is standing or sitting, and what's on offer. Chiaia Sera is evening, so no "di stamattina". Benedetta should say either "siediti dove vuoi" or name a specific table, not both. This is a cheap fix for the contradictions.

Adaptation is mostly untested, because these learners rarely show confusion. That's a test-design gap, not a prompt problem, so I wouldn't change anything there yet.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|
| Sergio Di Simo (proprietario) | Caffè Di Simo, Lucca | hesitant | 10 | 8 | 6 | 6 | 7.5 | 12 | 17 |
| Francesco Sorrentino (barista) | Bar Chiaia Sera, Napoli | english-beginner | 9 | 9 | 7 | 6 | 7.8 | 13 | 18 |
| Teresa Campagnoli (contadina) | Mercato Contadino, Orvieto | hesitant | 9 | 9 | 7 | 6 | 7.8 | 13 | 14 |
| Beatrice Salvi (studentessa) | Piazza Salimbeni, Siena | improving | 9 | 9 | 8 | 5 | 7.8 | 16 | 21 |
| Giorgio Bellini (giardiniere) | Giardini Margherita, Bologna | improving | 10 | 9 | 8 | 5 | 8.0 | 15 | 19 |
| Anna Virgili (proprietaria) | Caffè Virgilio, Mantova | hesitant | 9 | 9 | 7 | 7 | 8.0 | 14 | 18 |
| Luca Forno (pizzaiolo) | Pizzeria Nettuno, Taormina | improving | 10 | 9 | 8 | 6 | 8.3 | 15 | 17 |
| Beatrice Castelli (libraia) | Libreria Sant'Agostino, Bergamo | english-beginner | 9 | 9 | 8 | 7 | 8.3 | 12 | 14 |
| Benedetta Conti (chef) | Osteria Santo Spirito, Firenze | english-beginner | 10 | 10 | 8 | 6 | 8.5 | 12 | 18 |
| Alessandro Gallo (venditore ambulante) | Mercato Centrale Torino, Torino | hesitant | 10 | 9 | 8 | 7 | 8.5 | 11 | 14 |
| Emilia Spezie (commerciante di spezie) | Fondaco delle Spezie, Venezia | improving | 10 | 9 | 8 | 7 | 8.5 | 13 | 15 |
| Andrea Carli (sommelier) | Enoteca Properzio, Assisi | english-beginner | 10 | 10 | 9 | 7 | 9.0 | 12 | 16 |


## How this test works

1. **Sample.** Random characters from the city files (one per city), each at their own place.
2. **Simulate.** Claude plays a learner for 6 turns. The character's replies come from `lib/turn.ts`, the same code the app uses, so this is the real prompt.
3. **Grade.** A separate Claude call reads each transcript and scores the character 1–10 (10 = a native speaker would find it entirely natural):
   - **language**: Speaks Italian. Uses English when the learner asks for help (in English or in Italian), as much as the help takes, then returns to Italian; no English nobody asked for.
   - **understands**: Understands imperfect speech. Reads garbled speech-to-text and learner errors as what they meant, without commenting on them.
   - **adapts**: Adapts when the learner is lost. Talking fast or in complex Italian is fine (real people do); what matters is that when the learner signals confusion the character slows down and rephrases, and when they ask to repeat, repeats.
   - **alive**: Feels like a real person in that place. Distinct personality, reacts to what was said, recasts mistakes naturally instead of teaching.
4. **Measure length.** Counted, not graded: words in the opener, median and longest reply, share of replies over 30 words, questions per reply, and share asking more than one question (several threads at once). Yardstick: real conversational turns run about 1–2 seconds, roughly 5–10 words (Heldner & Edlund 2015; Stivers et al. 2009). These are measurements only; nothing is sent to the characters.
5. **Recommend.** One more call reads all the grades and lengths and suggests up to 3 changes. Nothing is changed automatically.

**Learner types**

- **english-beginner**: An American beginner (A1). Short, simple sentences. Typical mistakes: "voglio" instead of "vorrei", wrong article gender ("il pizza"), English word order. Some lines arrive garbled by speech-to-text, e.g. "bone journal" for "buongiorno", "quando costa" for "quanto costa", "gratsie" for "grazie".
- **hesitant**: A nervous beginner (A1). Hesitates ("ehm... io... "), sometimes says "ripeti per favore" or "più lentamente", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").
- **improving**: A learner around A2 who has been in Italy a few weeks. Uses past tense and longer sentences with occasional errors ("sono andato al mercato ieri e ho comprato le pomodori"). Curious and chatty; asks the character about themselves and the neighbourhood.
- All learners are told to be honest: when a line is too fast or complex for their level, they say so instead of pretending to follow.

**Reading the results**

- The sample is small and the conversations are random, so expect grades to move by about half a point between runs with no changes. Look for problems that repeat, not single scores.
- The learner is simulated. It catches clear failures (switching to English, correcting speech-to-text noise, never recovering when the learner is lost) but is no substitute for talking to the characters yourself.
- To compare before and after a change, run both with the same `--seed` (same characters and learners) and compare the grades and length numbers. The learner's lines still vary between runs, so look at clear differences, not small ones.

## Transcripts

### Francesco Sorrentino, Bar Chiaia Sera (Napoli) · english-beginner · 7.8

_Problem: Francesco is a bit generic and formulaic, repeating the same 'Vuoi X o Y?' offer-and-confirm pattern each turn, and he claims the cornetto is 'di stamattina' at a bar called Chiaia Sera (evening) right after saying 'Buonasera'._

```
Francesco Sorrentino: Buonasera! Benvenuto al bar. Io sono Francesco. Vuoi un caffè o uno spritz?
Learner: Vorrei un caffè, per favore.
Francesco Sorrentino: Perfetto! Il caffè a Napoli è il migliore. Un momento, arriva subito. Lo vuoi con zucchero o senza?
Learner: Lo vorrei con zucchero, per favore.
Francesco Sorrentino: Va bene, con zucchero! Ecco il tuo caffè. Attento, è caldo! Io lo bevo amaro, ma ognuno ha i suoi gusti.
Learner: Grazie, il caffè è molto buono!
Francesco Sorrentino: Che bello, mi fa piacere! A Napoli il caffè è una cosa seria. Vuoi anche un cornetto o un dolce?
Learner: Vorrei un cornetto, per favore.
Francesco Sorrentino: Ottima scelta! Il cornetto qui è fresco, di stamattina. Lo vuoi alla crema o al cioccolato?
Learner: Lo vorrei al cioccolato, per favore.
Francesco Sorrentino: Perfetto, al cioccolato! Ecco a te, è ancora tiepido. Io, sinceramente, preferisco quello alla crema, ma non dirlo a nessuno!
Learner: Va bene, non lo dico a nessuno!
Francesco Sorrentino: Ah, bravo, siamo d'accordo! Questo è il nostro piccolo segreto. Buon appetito!
```

### Teresa Campagnoli, Mercato Contadino (Orvieto) · hesitant · 7.8

_Problem: Teresa is pleasant but a bit generic and scripted, and the learner never shows confusion so adaptation goes untested; she also never reacts with real personality beyond a small 'meglio per la terra' touch._

```
Teresa Campagnoli: Buongiorno! Benvenuto al mercato. Ho pomodori, zucchine e fichi. Vuoi assaggiare un fico?
Learner: No, grazie, voglio solo comprare le zucchine.
Teresa Campagnoli: Va bene! Le zucchine sono belle oggi, le ho raccolte stamattina. Le vuoi piccole o grandi?
Learner: Voglio le zucchine grandi, per favore.
Teresa Campagnoli: Perfetto, queste sono grandi e buone! Quante ne vuoi? Una, due, tre?
Learner: Voglio tre zucchine, per favore.
Teresa Campagnoli: Ecco, tre zucchine grandi! Sono due euro. Vuoi anche i pomodori?
Learner: Sì, voglio anche i pomodori, per favore.
Teresa Campagnoli: Bene! I pomodori sono dolci e rossi, come il sole. Ne vuoi due o quattro?
Learner: Voglio due pomodori, per favore.
Teresa Campagnoli: Ecco, due pomodori! Li coltivo io, sono i miei. Con le zucchine sono tre euro. Vuoi un sacchetto?
Learner: No, grazie, non voglio un sacchetto.
Teresa Campagnoli: Va bene, niente sacchetto! Meglio per la terra. Allora, sono tre euro in tutto.
```

### Giorgio Bellini, Giardini Margherita (Bologna) · improving · 8.0

_Problem: Giorgio keeps firing generic yes/no or either-or questions (ti piace, preferisci) and repeats himself (says he works in the park twice, asks about liking Bologna and the park again), so he feels scripted and doesn't build on the learner's replies or share much of his own life._

```
Giorgio Bellini: Buongiorno! Bella giornata, vero? Io sono Giorgio. Lavoro qui, nel giardino. Ti piace il parco?
Learner: Sì, il parco mi piace molto!
Giorgio Bellini: Che bello! Anche a me piace tanto. Ogni mattina curo i fiori e gli alberi. Preferisci i fiori o gli alberi?
Learner: Preferisco gli alberi, sono grandi e belli.
Giorgio Bellini: Hai ragione! Gli alberi sono i signori del parco. Quel platano là ha più di cento anni. Ti piace?
Learner: Sì, il platano è molto bello!
Giorgio Bellini: Eh sì, è il mio preferito! Io lo saluto ogni mattina. Un po' pazzo, no? Tu sei in vacanza a Bologna?
Learner: Sì, sono in vacanza a Bologna.
Giorgio Bellini: Che bella vacanza! Oggi c'è un bel sole nel parco. Ti piace Bologna?
Learner: Sì, Bologna mi piace molto!
Giorgio Bellini: Che bello, sono contento! Io lavoro qui, nel parco, con le piante. Preferisci il sole o l'ombra?
Learner: Preferisco il sole, è bello e caldo.
Giorgio Bellini: Anch'io, il sole è bello! Ma i platani amano l'ombra, e io sotto il platano sto bene. Hai un posto preferito nel parco?
```

### Benedetta Conti, Osteria Santo Spirito (Firenze) · english-beginner · 8.5

_Problem: Benedetta contradicts herself by telling the learner to sit 'qui' and then asking about the table by the window or in back, and she keeps asking questions with a generic, scripted feel instead of showing much of a distinct personality._

```
Benedetta Conti: Ciao, benvenuto! Io sono Benedetta. Questa è la mia osteria. Hai fame?
Learner: Sì, ho un po' di fame.
Benedetta Conti: Bene, siediti qui, caro. Oggi ho la pasta fresca e la zuppa. Preferisci la pasta o la zuppa?
Learner: Preferisco la zuppa, grazie.
Benedetta Conti: Ottima scelta, caro! La zuppa è calda e buona. Ti porto anche il pane. Vuoi acqua o vino?
Learner: Vorrei l'acqua, per favore.
Benedetta Conti: Perfetto, ti porto l'acqua fresca. Siediti, rilassati, adesso ci penso io. Ti piace il pane toscano?
Learner: No, non mi piace il pane toscano.
Benedetta Conti: Ah, non fa niente, caro! Il pane toscano non ha sale, è vero. Ti porto i grissini. Va bene?
Learner: Sì, i grissini sono perfetti, grazie mille.
Benedetta Conti: Di niente, caro! Vado in cucina, la zuppa è quasi pronta. Preferisci il tavolo qui vicino alla finestra o in fondo?
Learner: Preferisco il tavolo in fondo.
Benedetta Conti: Va bene, tesoro, in fondo è più tranquillo. Siediti pure, io torno subito con l'acqua e i grissini.
```

### Alessandro Gallo, Mercato Centrale Torino (Torino) · hesitant · 8.5

_Problem: The character is pleasant but fairly generic, and the learner never shows confusion, so adaptation is untested; the cheese joke is the only real personality._

```
Alessandro Gallo: Buongiorno! Benvenuto al mercato! Ti piace il formaggio o il pane?
Learner: Mi piace il formaggio.
Alessandro Gallo: Bene! Anch'io! Questo formaggio è molto buono. Vuoi assaggiare?
Learner: Sì, grazie, voglio assaggiare il formaggio.
Alessandro Gallo: Ecco, prendi un pezzo. È di Torino, delle montagne qui vicino. Che ne dici?
Learner: Il formaggio è molto buono, grazie!
Alessandro Gallo: Che bello, sono contento! È il mio preferito, ma non lo dico agli altri formaggi! Ne vuoi un pezzo da portare a casa?
Learner: Sì, voglio un pezzo di formaggio, grazie.
Alessandro Gallo: Perfetto! Ecco qui, un bel pezzo. Sono cinque euro. Va bene?
Learner: Sì, va bene, ma ho solo dieci euro.
Alessandro Gallo: Nessun problema! Ecco il resto: cinque euro. Vuoi anche il pane, o solo il formaggio?
Learner: Voglio solo il formaggio, grazie.
Alessandro Gallo: Va bene! Solo formaggio, ottima scelta. Ecco il tuo pezzo e il resto. Buon appetito!
```

### Beatrice Salvi, Piazza Salimbeni (Siena) · improving · 7.8

_Problem: Beatrice is pleasant but generic and repetitive: she keeps circling back to sun, shade and heat, and she loops back to the piazza after already agreeing to go for gelato instead of moving the scene forward with any real personal detail._

```
Beatrice Salvi: Ciao! Io sono Beatrice. Sono qui in Piazza Salimbeni. Oggi c'è un bel sole. Ti piace?
Learner: Sì, mi piace il sole!
Beatrice Salvi: Anche a me! Il sole a Siena è bellissimo. Io sono studentessa. E tu, come ti chiami?
Learner: Mi chiamo Marco, e sono studente.
Beatrice Salvi: Piacere, Marco! Anche tu sei studente, che bello! Qui in piazza c'è sole, ma c'è anche un po' d'ombra. Preferisci il sole o l'ombra?
Learner: Preferisco l'ombra, perché fa caldo.
Beatrice Salvi: Eh sì, hai ragione, oggi fa caldo! Io sono un po' romantica, mi piace il sole. Ma andiamo all'ombra, va bene?
Learner: Sì, andiamo a prendere un gelato!
Beatrice Salvi: Che bella idea, Marco! Il gelato è perfetto quando fa caldo. Io adoro il gelato al limone. Tu preferisci cioccolato o fragola?
Learner: Preferisco il gelato alla fragola.
Beatrice Salvi: Ah, la fragola! Che dolce, mi piace. Allora andiamo, c'è una gelateria qui vicino. Io prendo il limone, tu la fragola.
Learner: Sì, andiamo a mangiare il gelato!
Beatrice Salvi: Perfetto! Siamo in Piazza Salimbeni, è un posto bellissimo. Guarda, c'è un po' d'ombra là. Camminiamo piano, fa caldo!
```

### Andrea Carli, Enoteca Properzio (Assisi) · english-beginner · 9.0

_Problem: Andrea is pleasant but generic, like a scripted waiter, with little specific personality, and he never recasts or reacts beyond repeating the learner's words back._

```
Andrea Carli: Buonasera! Benvenuto all'Enoteca Properzio. Vuoi un bicchiere di vino rosso o bianco?
Learner: Vorrei un bicchiere di vino rosso, grazie.
Andrea Carli: Ottima scelta! Qui in Umbria il Sangiovese e il Sagrantino sono molto buoni. Preferisci un vino leggero o forte?
Learner: Preferisco un vino forte, grazie.
Andrea Carli: Allora il Sagrantino! È un vino forte, come la nostra Umbria. Ecco il tuo bicchiere. Salute!
Learner: Il vino è molto buono, grazie!
Andrea Carli: Sono contento! Il Sagrantino è il mio vino preferito. Ti piace anche il formaggio con il vino?
Learner: Sì, mi piace il formaggio con il vino.
Andrea Carli: Perfetto! Qui abbiamo un pecorino umbro molto buono. Te ne porto un piatto?
Learner: Sì, grazie, un piatto di pecorino, per favore.
Andrea Carli: Subito! Il pecorino con il Sagrantino è un matrimonio perfetto. Ecco a te, buon appetito!
Learner: Il pecorino è un po' forte, ma mi piace.
Andrea Carli: Bene! Un vino forte e un formaggio forte. Hai buon gusto! Vuoi un po' di miele con il pecorino, o preferisci così?
```

### Emilia Spezie, Fondaco delle Spezie (Venezia) · improving · 8.5

_Problem: Emilia is somewhat generic and scripted, mostly asking yes/no questions and not engaging with the learner's chattiness or building much personality beyond 'come me' and a vague Venice nod._

```
Emilia Spezie: Buongiorno! Benvenuto al Fondaco delle Spezie. Ti piace il profumo? Cannella o pepe?
Learner: Mi piace il pepe, grazie.
Emilia Spezie: Ottimo! Il pepe è forte e buono, come me. Questo è pepe nero. Vuoi sentire?
Learner: Sì, voglio sentire il pepe nero.
Emilia Spezie: Ecco, senti! È un profumo forte, come a Venezia una volta. Ti piace?
Learner: Il profumo è troppo forte, non mi piace.
Emilia Spezie: Ah, troppo forte! Va bene, il pepe non è per tutti. Questa è la cannella, più dolce. Vuoi sentire?
Learner: Sì, voglio comprare la cannella.
Emilia Spezie: Bene, la cannella è un'ottima scelta! Ecco, senti prima. Dolce, vero? Ne vuoi un sacchetto piccolo o grande?
Learner: Voglio un sacchetto piccolo, grazie.
Emilia Spezie: Perfetto! Ecco il sacchetto piccolo. Sono cinque euro. Hai i soldi?
Learner: Sì, ho solo una carta, va bene?
Emilia Spezie: Una carta per cinque euro? Va bene, per questa volta! Ecco il lettore. Vuoi anche lo scontrino?
```

### Sergio Di Simo, Caffè Di Simo (Lucca) · hesitant · 7.5

_Problem: The character never actually has to adapt, but it also barely reacts to the learner's content, falling back on generic barista filler and a leading 'Sì o no?' that feels like a teaching prompt rather than a real person's chat._

```
Sergio Di Simo: Buongiorno! Benvenuto al Caffè Di Simo. Vuole un caffè o un cornetto?
Learner: Vorrei un caffè, per favore.
Sergio Di Simo: Perfetto! Un buon caffè, subito. Lo prende al banco o al tavolo?
Learner: Lo prendo al banco, grazie.
Sergio Di Simo: Ah, come un vero lucchese! Ecco il suo caffè, caldo e buono. Con zucchero o senza?
Learner: Lo prendo senza zucchero, grazie.
Sergio Di Simo: Bravo! Senza zucchero, così si sente il vero sapore. Il caffè è il mio orgoglio. Buon caffè!
Learner: Il caffè è davvero caldo, grazie!
Sergio Di Simo: Eh sì, caldo come deve essere! Qui facciamo il caffè con cura. Le piace? Sì o no?
Learner: Sì, il caffè è molto buono, grazie!
Sergio Di Simo: Che bello sentirlo! Mi fa molto piacere. Questo è il mio bar da tanti anni, e Lucca è la mia casa.
Learner: Lucca è una città molto bella.
Sergio Di Simo: Grazie! Sì, Lucca è bellissima. Le mura, la piazza, le piccole strade... Io non cambio niente. Lei è qui in vacanza, o abita qui?
```

### Luca Forno, Pizzeria Nettuno (Taormina) · improving · 8.3

_Problem: Luca is a repetitive order-taking script that keeps asking choice questions, and he says "Bravo, la diavola è piccante!" as if praising the learner for choosing a spicy pizza, which feels slightly patronizing and unnatural._

```
Luca Forno: Ciao! Benvenuto alla Pizzeria Nettuno! Io sono Luca. Vuoi una pizza margherita o una diavola?
Learner: Vorrei una pizza diavola, per favore.
Luca Forno: Perfetto! Una diavola! La mia pasta è morbida e bella. Piccante o molto piccante?
Learner: La vorrei piccante, per favore.
Luca Forno: Benissimo! Piccante! Io preparo la pasta adesso. Il forno è molto caldo! Vuoi una birra o un'acqua?
Learner: Vorrei un'acqua, per favore.
Luca Forno: Va bene, un'acqua! Bravo, la diavola è piccante! Io faccio la pizza adesso. Acqua frizzante o naturale?
Learner: Vorrei l'acqua frizzante, per favore.
Luca Forno: Perfetto! Acqua frizzante e una diavola piccante. Ecco, la pasta è pronta e adesso va nel forno. Una pizza bella calda!
Learner: Grazie, Luca! Aspetto volentieri.
Luca Forno: Prego! Due minuti e la pizza è pronta. Il forno è a quattrocento gradi, è velocissimo! Ti piace il piccante?
Learner: No, non mi piace il piccante.
Luca Forno: Ah, davvero? Ma la diavola è molto piccante! Ahah! Posso fare una margherita, non è piccante. Vuoi la diavola o la margherita?
```

### Anna Virgili, Caffè Virgilio (Mantova) · hesitant · 8.0

_Problem: Anna never has to adapt because the learner is fluent here, and her replies are somewhat generic and formulaic (each ends with a question, plain praise like 'Ottima scelta'), with little distinct personality or local color._

```
Anna Virgili: Buongiorno! Benvenuto al Caffè Virgilio. Io sono Anna. Vuoi un caffè o un cappuccino?
Learner: Vorrei un cappuccino, per favore.
Anna Virgili: Certo! Un cappuccino arriva subito. Ottima scelta per la mattina. Vuoi anche una brioche?
Learner: Sì, grazie, vorrei una brioche.
Anna Virgili: Perfetto! Cappuccino e brioche: una colazione da poeti. La preferisci con la crema o con la marmellata?
Learner: La preferisco con la marmellata, grazie.
Anna Virgili: Va bene, con la marmellata. Una scelta semplice e buona. Siediti pure qui vicino alla finestra: preparo tutto subito.
Learner: Grazie, mi siedo qui vicino alla finestra.
Anna Virgili: Bene! Da qui vedi la piazza e la gente che passa. Il caffè arriva tra un minuto. Ti piace questo posto?
Learner: Sì, questo posto è molto bello.
Anna Virgili: Che bella cosa da sentire, grazie! Questo caffè è la mia casa. Ecco il tuo cappuccino, ancora caldo.
Learner: Grazie, il cappuccino è troppo caldo.
Anna Virgili: Hai ragione, è appena fatto. Aspetta un momento e bevi piano. La brioche è ancora calda: la vuoi adesso o dopo?
```

### Beatrice Castelli, Libreria Sant'Agostino (Bergamo) · english-beginner · 8.3

_Problem: Her replies are a bit formulaic, each ending in a question, and she barely adds a personal detail or a real recommendation, such as a Mexican cookbook that actually exists in the shop._

```
Beatrice Castelli: Buongiorno! Benvenuto alla libreria. Cerchi un libro in italiano o in inglese?
Learner: Cerco un libro in inglese.
Beatrice Castelli: Va bene. I libri in inglese sono qui, vicino alla finestra. Cerchi un romanzo?
Learner: No, cerco un libro di cucina.
Beatrice Castelli: Ah, un libro di cucina! Bello. Anche quelli sono qui, sul tavolo grande. Cucini italiano o altro?
Learner: Cucino cibo messicano.
Beatrice Castelli: Cibo messicano, che bello! A me piace il piccante. Cerchi un libro con le foto?
Learner: No, cerco un libro senza foto.
Beatrice Castelli: Senza foto, bene! Anch'io preferisco le parole. Cerchi da solo o ti aiuto io?
Learner: Cerco da solo, grazie.
Beatrice Castelli: Va bene, con calma. Il tavolo grande è lì, a destra. Io sono qui, alla cassa.
Learner: Grazie, sei molto gentile.
Beatrice Castelli: Prego! Qui c'è silenzio, e io lo adoro. Anche a te piace il silenzio?
```
