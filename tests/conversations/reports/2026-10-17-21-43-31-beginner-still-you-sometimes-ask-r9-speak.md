# Conversation test

2026-10-17 21:43 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, sometimes ask" · 12 conversations · 6 learner turns each

## Grade: 8.1 / 10

| Criterion | Average |
|---|---|
| language | 8.8 |
| understands | 9.3 |
| adapts | 7.8 |
| alive | 6.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 12 |
| Reply (median words) | 16.5 |
| Reply (average words) | 17.2 |
| Longest reply (words) | 29 |
| Replies over 30 words | 0% |
| Questions per reply | 1 |
| Replies asking 2+ questions | 7% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Characters are generic and share little of their own.** They answer, then hand the turn back, with no opinions, local color, or personal detail. Giorgio: "Senti gli uccellini, sì o no?" Beatrice Salvi: "Sì, leggo molta poesia! E sì, c'è una bella libreria qui vicino."
2. **Nearly every turn ends in a question or offer, and replies run long.** Median replies are 12 to 24 words, against a real-conversation norm of about 10 or fewer. The closers repeat ("Vuoi toccare l'impasto?", "Ottima scelta con il rosso! Pecorino o caprino?"), so the characters feel scripted and the learner has less room to talk.
3. **Characters don't help in English when the learner asks for it.** These had the lowest scores in the set. Anna: "Ma qui parliamo piano, in italiano." Sergio explained "si accomodi" in Italian only. Alessandro did the same for "assaggia".

## Recommendations

1. **Give each character a few concrete specifics in the character data.** For example, an opinion, a small complaint, a local fact, or a family member (Siena's Camollia, Teresa's farm, Luca's dough habits). Add one line to the prompt: they have their own day and views, and can simply say something about it instead of asking. This fixes the generic feel without adding rules about how to talk.

2. **Add a short per-turn reminder in `build-turn-prompt.ts`.** Something like: "Answer the way a person would in a quick back-and-forth: usually a sentence or two. Not every turn needs a question." This targets both the length drift and the closing-question habit. Put it in the turn prompt rather than the character prompt, which should stay situational.

3. **Add one line to `character.md` for learners who ask for help in English.** If someone asks in English what a word means or whether you speak English, give a quick English answer, then go back to Italian. This is a failure to help rather than a style issue, and it only applies when the learner has shown they're lost. Recasting of learner slips ("il pizza", "allegro") is a smaller issue, so I'd leave it for now.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|
| Anna Virgili (proprietaria) | Caffè Virgilio, Mantova | hesitant | 5 | 9 | 6 | 6 | 6.5 | 14 | 15 |
| Sergio Di Simo (proprietario) | Caffè Di Simo, Lucca | hesitant | 6 | 9 | 7 | 6 | 7.0 | 12 | 15 |
| Alessandro Gallo (venditore ambulante) | Mercato Centrale Torino, Torino | hesitant | 8 | 9 | 7 | 6 | 7.5 | 11 | 12 |
| Beatrice Salvi (studentessa) | Piazza Salimbeni, Siena | improving | 9 | 9 | 8 | 6 | 8.0 | 16 | 19 |
| Beatrice Castelli (libraia) | Libreria Sant'Agostino, Bergamo | english-beginner | 9 | 9 | 8 | 6 | 8.0 | 11 | 17 |
| Francesco Sorrentino (barista) | Bar Chiaia Sera, Napoli | english-beginner | 9 | 9 | 8 | 7 | 8.3 | 12 | 16 |
| Giorgio Bellini (giardiniere) | Giardini Margherita, Bologna | improving | 10 | 10 | 8 | 6 | 8.5 | 15 | 22 |
| Benedetta Conti (chef) | Osteria Santo Spirito, Firenze | english-beginner | 10 | 9 | 8 | 7 | 8.5 | 12 | 17 |
| Andrea Carli (sommelier) | Enoteca Properzio, Assisi | english-beginner | 9 | 10 | 8 | 7 | 8.5 | 8 | 15 |
| Teresa Campagnoli (contadina) | Mercato Contadino, Orvieto | hesitant | 10 | 9 | 8 | 8 | 8.8 | 15 | 15 |
| Emilia Spezie (commerciante di spezie) | Fondaco delle Spezie, Venezia | improving | 10 | 9 | 9 | 7 | 8.8 | 15 | 22 |
| Luca Forno (pizzaiolo) | Pizzeria Nettuno, Taormina | improving | 10 | 10 | 9 | 7 | 9.0 | 10 | 24 |


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

### Teresa Campagnoli, Mercato Contadino (Orvieto) · hesitant · 8.8

_Problem: When asked to slow down, Teresa only shortened the question slightly rather than truly simplifying, and she added "Bravo, parli bene!" earlier, which is mild teaching-style commentary._

```
Teresa Campagnoli: Buongiorno! Benvenuto al mio banco. Oggi ho pomodori, zucchine e fichi. Vuoi assaggiare un fico?
Learner: Ehm... buongiorno. Sì, un fico, per favore... grazie.
Teresa Campagnoli: Ecco, prendi pure. Sono dolci, di stamattina, dal mio albero. Allora, ti piace?
Learner: Ehm... sì, è... buono! Molto dolce. Grazie.
Teresa Campagnoli: Eh, lo so! I miei fichi non sbagliano mai. Ne vuoi mezzo chilo o un chilo?
Learner: Ehm... mezzo chilo, per favore. Quanto... costa?
Teresa Campagnoli: Mezzo chilo costa tre euro. Bravo, parli bene! Ecco i fichi.
Learner: Ehm... grazie! Tre euro... ecco, per favore.
Teresa Campagnoli: Grazie a te! Buon appetito, e stai attento: i fichi maturi si rovinano presto. Mangiali oggi! Sei di qui o sei in vacanza?
Learner: Ehm... scusi, non capisco. Più lentamente, per favore?
Teresa Campagnoli: Va bene, piano piano! Tu abiti qui, a Orvieto, o sei in vacanza?
Learner: Ehm... io... sono in vacanza. Sono... americano.
Teresa Campagnoli: Ah, americano! Benvenuto a Orvieto. I miei fichi sono i migliori del mercato, eh! Ti piace Orvieto?
```

### Francesco Sorrentino, Bar Chiaia Sera (Napoli) · english-beginner · 8.3

_Problem: Francesco is a fairly generic, friendly barista: he only lightly recasts mistakes (never echoing 'la pizza') and his Naples flavor is thin (an olive with the spritz, a 'Scusa, New York!' aside)._

```
Francesco Sorrentino: Buonasera! Benvenuto al Bar Chiaia Sera. Vuoi un caffè o uno spritz?
Learner: Bone sera! Voglio un spritz, per favore.
Francesco Sorrentino: Perfetto! Uno spritz, ottima scelta per la sera. Arriva subito. Lo vuoi con Aperol o con Campari?
Learner: Aperol, per favore. Gratsie!
Francesco Sorrentino: Prego! Ecco il tuo spritz con Aperol. Qui a Napoli lo beviamo con un'oliva. Ti piace?
Learner: Sì, mi piace! Gratsie mille.
Francesco Sorrentino: Bene, sono contento! Prego, figurati. Salute! Sei qui in vacanza?
Learner: Sì, io sono in vacanza. Io sono da America.
Francesco Sorrentino: Ah, dall'America! Benvenuto a Napoli! Qui a Chiaia la sera è bellissima. Ti piace Napoli?
Learner: Sì, mi piace Napoli! Il cibo è molto buono.
Francesco Sorrentino: Hai ragione! La pizza qui è la migliore del mondo. Scusa, New York! Preferisci la pizza o la pasta?
Learner: Mi piace la pizza! Io mangio il pizza ogni giorno.
Francesco Sorrentino: Ogni giorno! Come un vero napoletano. La pizza è sempre una buona idea. Margherita o marinara?
```

### Giorgio Bellini, Giardini Margherita (Bologna) · improving · 8.5

_Problem: Giorgio ends turns with stock yes/no tag questions ('sì o no?') and generic small talk, so he feels like a scripted conversation partner more than a gardener with real opinions or details._

```
Giorgio Bellini: Buongiorno! Bella giornata, vero? Io sono Giorgio. Lavoro qui, nei giardini. Ti piace il parco?
Learner: Buongiorno, Giorgio! Mi chiamo Anna, e sì, mi piace molto il parco. Sono arrivata a Bologna tre settimane fa e ieri sono venuta qui per la prima volta. Lei lavora qui da tanto tempo?
Giorgio Bellini: Piacere, Anna! Benvenuta a Bologna. Sì, lavoro qui da vent'anni. Per me il parco è come casa. Preferisci i fiori o gli alberi?
Learner: Piacere, Giorgio! Vent'anni, che bello! Preferisco i fiori, ma ieri ho visto un albero molto grande vicino al lago. Come si chiama?
Giorgio Bellini: Ah, vicino al lago! Credo sia un platano. È grande e vecchio, come me! Ti piace l'ombra sotto l'albero, sì o no?
Learner: Sì, mi piace molto l'ombra! Ieri ho letto un libro sotto l'albero. Lei ha un albero preferito nel parco?
Giorgio Bellini: Sì! Il mio albero preferito è un grande cedro. È tranquillo e fa tanta ombra. Tu leggi libri in italiano o in inglese?
Learner: Leggo in inglese, ma ieri ho provato a leggere un libro facile in italiano. Dov'è il cedro? Posso vedere?
Giorgio Bellini: Bravissima, un libro in italiano! Certo, puoi vedere il cedro. È vicino al laghetto, a sinistra. Ti porto io adesso, va bene?
Learner: Sì, grazie mille! Che gentile. Andiamo adesso?
Giorgio Bellini: Sì, andiamo! Seguimi, è qui vicino. Che bella giornata! Senti gli uccellini, sì o no?
Learner: Sì, sento gli uccellini! Sono molto belli. Ieri ho visto anche due anatre nel lago, sono carine!
Giorgio Bellini: Sì, le anatre sono simpatiche! Stanno sempre qui, come me. Ecco il cedro, guarda! È grande, vero?
```

### Benedetta Conti, Osteria Santo Spirito (Firenze) · english-beginner · 8.5

_Problem: Benedetta's warmth is generic and a bit repetitive ("Brava", "caro" in nearly every line), with little distinctive chef personality, and she doesn't naturally recast "il pizza" or "Dove io siedo" beyond a tiny implicit nudge._

```
Benedetta Conti: Ciao, benvenuto! Sono Benedetta, la cuoca. Hai fame? Qui si mangia bene!
Learner: Ciao Benedetta! Sì, io ho molto fame. Voglio il pizza?
Benedetta Conti: Brava persona, hai fame! Qui non c'è la pizza, ma c'è una pasta buonissima. Vuoi la pasta o la zuppa?
Learner: Voglio la pasta, per favore. Che tipo di pasta?
Benedetta Conti: Brava, la pasta! Oggi ho le pappardelle al ragù, fatte da me. Oppure la pasta al pomodoro, semplice e leggera. Quale vuoi?
Learner: Voglio le pappardelle al ragù, per favore. Quanto costa?
Benedetta Conti: Ottima scelta, caro! Costano dodici euro. Siediti qui, ti porto un po' di pane. Vuoi anche l'acqua?
Learner: Sì, voglio l'acqua, per favore. Dove io siedo?
Benedetta Conti: Siediti lì, al tavolo vicino alla finestra. Ti porto l'acqua subito. La vuoi frizzante o naturale?
Learner: Naturale, per favore. Gratsie!
Benedetta Conti: Prego, caro! Arrivo subito con l'acqua e il pane. Poi le pappardelle, calde calde!
Learner: Grazie mille! Il pane è gratis?
Benedetta Conti: Sì, oggi per te è gratis, caro! Mangia, mangia, hai fame! È pane toscano, senza sale. Ti piace il pane?
```

### Beatrice Salvi, Piazza Salimbeni (Siena) · improving · 8.0

_Problem: Beatrice stays generic and eager, answering each question briefly and handing back a formulaic question, with little personal detail or local color about Siena, Camollia, or the bookshop she mentions._

```
Beatrice Salvi: Ciao! Io sono Beatrice. Sono qui in Piazza Salimbeni. Oggi c'è un bel sole. Ti piace?
Learner: Ciao Beatrice, io sono Marco. Sì, mi piace molto! Ieri sono andato al Campo e ho mangiato un gelato, e tu sei di Siena?
Beatrice Salvi: Piacere, Marco! Sì, sono di Siena. Che bello, un gelato al Campo! Cioccolato o limone?
Learner: Cioccolato e nocciola, buonissimo! E tu, Beatrice, abiti qui vicino a Piazza Salimbeni?
Beatrice Salvi: Ottima scelta, Marco! Sì, abito qui vicino, nel quartiere di Camollia. Mi piace molto questa piazza. È tranquilla e romantica.
Learner: Camollia, che bello! Sei studentessa all'università, e che cosa studi?
Beatrice Salvi: Sì, sono studentessa. Studio lettere. Amo i libri e la poesia. E tu, ti piace leggere?
Learner: Sì, mi piace leggere, ma il mio italiano è ancora difficile! Tu leggi molti libri di poesia, e c'è una libreria bella qui vicino?
Beatrice Salvi: Sì, leggo molta poesia! E sì, c'è una bella libreria qui vicino. Il tuo italiano va bene, Marco! Preferisci i romanzi o la poesia?
Learner: Preferisco i romanzi, perché la poesia è un po' difficile per me. Tu hai un poeta preferito?
Beatrice Salvi: Sì, i romanzi sono più facili! Il mio poeta preferito è Montale. Mi piace perché è malinconico e bello. Anche tu hai un autore preferito?
Learner: Sì, mi piace Elena Ferrante. Ho letto "L'amica geniale" la settimana scorsa, è molto bello! Tu lo conosci?
Beatrice Salvi: Sì, lo conosco! È una bella storia di due amiche. Io amo Lila. E tu, preferisci Lila o Lenù?
```

### Alessandro Gallo, Mercato Centrale Torino (Torino) · hesitant · 7.5

_Problem: When the learner asked in English what 'assaggia' meant, he did not give a brief English gloss but explained in Italian, and he tilted toward a teacher-like definition while pushing the sale._

```
Alessandro Gallo: Buongiorno! Benvenuto al mercato! Ti piace il formaggio o il pane?
Learner: Ehm... buongiorno. Ehm... io... il pane, per favore.
Alessandro Gallo: Ottima scelta! Il pane qui è fresco, di stamattina. Grande o piccolo?
Learner: Ehm... piccolo, per favore. Quanto... quanto costa?
Alessandro Gallo: Il pane piccolo costa due euro. È buonissimo, ancora caldo! Va bene?
Learner: Ehm... sì, va bene. Ehm... due euro, ecco... grazie.
Alessandro Gallo: Grazie a te! Ecco il tuo pane, ancora caldo. Il formaggio qui vicino è molto buono, sai? Lo vuoi assaggiare?
Learner: Ehm... scusi, non capisco. Ripeti, per favore... più lentamente?
Alessandro Gallo: Certo, piano! Questo è formaggio. Un assaggio, gratis. Lo vuoi, sì o no?
Learner: Ehm... sì, grazie. Ehm... gratis? Okay.
Alessandro Gallo: Sì, sì, gratis! Ecco un pezzetto di formaggio. Assaggia, assaggia!
Learner: Ehm... "assaggia"... sorry, what? Ehm... mangio il formaggio? Okay... mmm, è buono, grazie!
Alessandro Gallo: Sì, esatto! Assaggiare è mangiare un pochino. Sono contento, il formaggio è del Piemonte! Lo vuoi comprare, sì o no?
```

### Andrea Carli, Enoteca Properzio (Assisi) · english-beginner · 8.5

_Problem: Andrea stays a bit generic and salesy, repeating 'Ottima scelta' and giving little distinctive personality or detail, and he doesn't naturally recast the learner's English slip 'very good' into Italian beyond a bare echo._

```
Andrea Carli: Buonasera, benvenuto all'Enoteca Properzio! Vuole rosso o bianco?
Learner: Buonasera. Voglio il rosso, per favore.
Andrea Carli: Ottima scelta! Qui in Umbria il rosso è importante. Lo vuole forte o leggero?
Learner: Leggero, per favore. Gratsie.
Andrea Carli: Prego! Ho un Sangiovese leggero, fresco ed elegante. Ecco il bicchiere. Le piace il Sangiovese?
Learner: Sì, mi piace. Quando costa il bicchiere?
Andrea Carli: Il bicchiere costa sei euro. È un prezzo onesto per un vino così elegante! Va bene?
Learner: Sì, va bene. Sei euro, okay. Gratsie!
Andrea Carli: Perfetto, prego! Salute! Questo vino viene da una piccola cantina vicino ad Assisi. Buono, no?
Learner: Sì, è molto buono! Il vino è... very good.
Andrea Carli: Sono contento! Sì, è molto buono. Qui a Assisi il vino è una cosa seria. Vuole un po' di formaggio o del pane?
Learner: Sì, formaggio, per favore. Quanto costa?
Andrea Carli: Il formaggio costa cinque euro. Ottima scelta con il rosso! Pecorino o caprino?
```

### Sergio Di Simo, Caffè Di Simo (Lucca) · hesitant · 7.0

_Problem: When the learner asked in English if he speaks English, Sergio explained 'si accomodi' in Italian only ("vuol dire: si sieda, prego") with no English, so the help was still hard for an A1 to follow._

```
Sergio Di Simo: Buongiorno! Benvenuto al Caffè Di Simo. Vuole un caffè o un cornetto?
Learner: Ehm... buongiorno. Ehm... un caffè, per favore.
Sergio Di Simo: Benissimo! Un caffè, subito. Il mio caffè è molto buono. Al banco o al tavolo?
Learner: Ehm... scusi, non capisco. Ripeti per favore, più lentamente?
Sergio Di Simo: Certo, certo. Con calma. Il caffè... qui, al banco? Oppure là, al tavolo?
Learner: Ehm... al tavolo, per favore. Grazie.
Sergio Di Simo: Perfetto! Si accomodi pure, il tavolo vicino alla finestra è il migliore. Il caffè arriva subito.
Learner: Ehm... scusi, "si accomodi"... non capisco. Do you speak English?
Sergio Di Simo: Un pochino, sì! "Si accomodi" vuol dire: si sieda, prego. Il tavolo è là, vicino alla finestra.
Learner: Ah, okay... ehm... grazie! Il tavolo... là, vicino alla finestra?
Sergio Di Simo: Sì, esatto! Là, vicino alla finestra. Il caffè arriva subito. Lo vuole con un cornetto, o solo?
Learner: Ehm... solo, per favore. Grazie!
Sergio Di Simo: Bene, un caffè solo. Come si fa a Lucca: piccolo e forte. Arriva subito.
```

### Emilia Spezie, Fondaco delle Spezie (Venezia) · improving · 8.8

_Problem: Emilia is a bit formulaic, ending nearly every turn with an offer or question ("Vuoi sentire...?", "Ti piace...?"), and she shares little about herself or her family beyond what's asked._

```
Emilia Spezie: Buongiorno! Benvenuto al Fondaco delle Spezie. Vuoi sentire il profumo del pepe o della cannella?
Learner: Buongiorno! Mi piace la cannella, ma ieri sono andato al mercato e ho comprato il pepe. Lei lavora qui da molto tempo?
Emilia Spezie: Sì, da tanti anni! Il fondaco è della mia famiglia. Bene, la cannella è buona con il caffè. Ti piace il caffè?
Learner: Sì, mi piace molto! Ieri ho bevuto un caffè in Piazza San Marco, ma era troppo caro. Lei prepara il caffè con la cannella a casa?
Emilia Spezie: Sì, a casa sì, con un pizzico di cannella! Piazza San Marco è bella, ma i prezzi sono pazzi. Qui a Dorsoduro è meglio! Vuoi sentire la cannella adesso?
Learner: Sì, volentieri! Che cosa significa "pizzico"? E qui a Dorsoduro dove posso bere un caffè buono e non troppo caro?
Emilia Spezie: Un pizzico è poca cannella, così, con due dita. Ecco, senti! Per il caffè vai a Campo Santa Margherita: è buono e costa poco. Ti piace il profumo?
Learner: Sì, il profumo è molto buono! Ho capito, un pizzico è poca cannella. Grazie per il consiglio, domani vado a Campo Santa Margherita!
Emilia Spezie: Bravo! Domani un caffè buono, senza spendere troppo. Poi torna qui e dimmi se ti è piaciuto! Vuoi provare anche il pepe nero o la vaniglia?
Learner: Volentieri! Vorrei sentire la vaniglia, perché non ho mai comprato la vaniglia. Lei usa la vaniglia per fare i dolci?
Emilia Spezie: Sì, uso la vaniglia per i dolci, soprattutto per la crema! Ecco, senti: è dolce, vero? Costa tanto, ma basta un baccello.
Learner: Sì, è molto dolce e buona! Scusi, che cosa significa "baccello"?
Emilia Spezie: Il baccello è questo bastoncino lungo e scuro. Dentro ci sono tanti semini neri. Lo vedi? Ne basta uno per una crema!
```

### Anna Virgili, Caffè Virgilio (Mantova) · hesitant · 6.5

_Problem: When the learner asked in English "do you speak English?" about the word "finestra", Anna refused to help in English and just pointed at the window in Italian, which is a failure to give the requested help._

```
Anna Virgili: Buongiorno! Benvenuto al Caffè Virgilio. Io sono Anna. Vuoi un caffè o un tè?
Learner: Buongiorno... ehm... io... un caffè, per favore.
Anna Virgili: Perfetto! Un caffè, subito. Qui a Mantova il caffè è una piccola poesia. Lo vuoi al banco o al tavolo?
Learner: Ehm... scusi, non capisco. Ripeti per favore, più lentamente?
Anna Virgili: Certo, con piacere. Il caffè... qui, al banco? Oppure là, al tavolo?
Learner: Ehm... al tavolo, per favore. Grazie.
Anna Virgili: Benissimo! Il tavolo vicino alla finestra è libero. Siediti pure, arrivo subito con il caffè.
Learner: Ehm... grazie mille. Scusi, "finestra"... ehm... do you speak English?
Anna Virgili: Un pochino, sì! Ma qui parliamo piano, in italiano. La finestra è là, vicino al tavolo. Vedi? Capito?
Learner: Ehm... sì, la finestra... ok. Grazie, signora.
Anna Virgili: Prego! Un momento e arrivo con il caffè. Con zucchero o senza zucchero?
Learner: Ehm... senza zucchero, per favore. Grazie.
Anna Virgili: Perfetto, un caffè senza zucchero. Il caffè qui è forte, come piace a me. Ecco, siediti pure e rilassati.
```

### Beatrice Castelli, Libreria Sant'Agostino (Bergamo) · english-beginner · 8.0

_Problem: Beatrice is a pleasant but generic shop assistant who mostly asks questions and gives little personality beyond one remark about sad books, and she never recasts the learner's gender slip "allegro" (a woman would say "allegra" to match her own "allegra" question)._

```
Beatrice Castelli: Buongiorno! Benvenuto alla libreria Sant'Agostino. Cerchi un libro, o guardi soltanto?
Learner: Bone journal. Io voglio un libro in inglese, per favore.
Beatrice Castelli: Certo! I libri in inglese sono qui, a sinistra. Preferisci un romanzo o un libro di storia?
Learner: Un romanzo, per favore. Io non parlo molto italiano.
Beatrice Castelli: Va bene, nessun problema. Il tuo italiano è chiaro. I romanzi sono qui, su questo scaffale. Vuoi un classico o un libro moderno?
Learner: Un libro moderno, per favore. Grazie!
Beatrice Castelli: Bene! Ecco i libri moderni. Io amo le storie un po' tristi. E tu, triste o allegra?
Learner: Allegro, per favore. Io non voglio un libro triste.
Beatrice Castelli: Peccato, io preferisco i libri tristi! Ma va bene. Questo romanzo è allegro e divertente. Vuoi vederlo?
Learner: Sì, grazie! Quanto costa?
Beatrice Castelli: Ecco, guardalo pure. Costa quindici euro. Va bene per te?
Learner: Sì, va bene. Voglio il libro, per favore.
Beatrice Castelli: Perfetto! Lo metto in una busta. Ecco a te. Sono quindici euro, grazie.
```

### Luca Forno, Pizzeria Nettuno (Taormina) · improving · 9.0

_Problem: Luca keeps circling back to 'impasto' and ends nearly every turn with a pushy offer question, so he feels somewhat scripted and doesn't react to or build on the learner's other remarks._

```
Luca Forno: Ciao! Benvenuto al Pizzeria Nettuno! Io sono Luca. Hai fame?
Learner: Ciao Luca! Sì, ho molta fame, ieri sono andato al mare e non ho mangiato niente. Tu sei il pizzaiolo? Da quanto tempo lavori qui?
Luca Forno: Sì, sono il pizzaiolo! Lavoro qui da quindici anni. Il mare ti ha dato fame, eh! Vuoi una pizza Margherita o una diavola?
Learner: Quindici anni, che bello! Cos'è una diavola? È piccante? Io non mangio molto piccante.
Luca Forno: Sì, la diavola è piccante! Ha salame e peperoncino. Il diavolo è forte! Per te è meglio la Margherita. Va bene?
Learner: Sì, va bene, la Margherita per favore! Tu mangi la pizza ogni giorno? Qual è il tuo ristorante preferito a Taormina?
Luca Forno: Perfetto, una Margherita! Sì, mangio la pizza quasi ogni giorno. Il mio ristorante preferito? Questo, ovviamente! Adesso faccio l'impasto per te. Vuoi acqua o birra?
Learner: Ahah, ovviamente! Per me acqua, per favore, perché oggi fa molto caldo. Cos'è l'impasto?
Luca Forno: Acqua, subito! L'impasto è la base della pizza: farina, acqua, sale e lievito. Guarda, è morbido come una nuvola! Per me l'impasto è tutto.
Learner: Ah, capisco! Ma cos'è il lievito? E ieri io ho visto una pizzeria vicino al mare, ma non era buona come questa!
Luca Forno: Il lievito fa crescere l'impasto. Senza lievito, la pizza è piatta come un biscotto! E grazie, sono contento: qui l'impasto riposa due giorni. Vuoi vedere l'impasto?
Learner: Sì, voglio vedere! Due giorni è molto tempo, perché riposa così tanto?
Luca Forno: Ecco, guarda! Riposa due giorni perché così la pizza è più leggera e più buona. Anche l'impasto ha bisogno di dormire! Vuoi toccare l'impasto?
```
