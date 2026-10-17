# Conversation test

2026-10-17 03:03 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation" · 5 conversations · 6 learner turns each

## Grade: 8.4 / 10

| Criterion | Average |
|---|---|
| language | 9.8 |
| understands | 9.4 |
| adapts | 8.2 |
| alive | 6.4 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 8 |
| Reply (median words) | 14 |
| Reply (average words) | 13.2 |
| Longest reply (words) | 22 |
| Replies over 30 words | 0% |
| Questions per reply | 0.5 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
1. Characters feel generic, with little personality or local color, and they rarely add something specific or ask back: "Sí, es una iglesia muy bonita. ¡Bienvenido a Jalatlaco!" (Alive scores are 6-7 for all five.)
2. When the learner is lost, the repair is weak. Sofía re-offers the word that caused the problem, and Lupe just trims the sentence: "¿Quieres probar otro dulce?" / "¡Claro, mi cielo! Ya casi está."
3. Endearments act as filler and repeat: "mi vida" and "mi cielo" stand in for personality. Chuy's one slip ("que le gusta") is a one-off and not worth acting on.

## Recommendations
1. **Give each character a concrete "right now" in character data.** Add two or three specifics per person: something they're in the middle of, an opinion or small grievance, a local detail. For example, Sofía is covering for her tía and has a favorite cocada, or Don Víctor taught history and can't resist a date. This describes the situation, not how to talk, so it fits the minimal prompt. It also gives them something real to react with or ask about, which should lift "alive" without touching length.

2. **When the learner signals confusion, add a short note in `build-turn-prompt.ts`.** If the learner asks for a repeat or answers off-target, append something like: "The learner didn't follow your last line. Say it differently, with other words, or point at something in the scene." That targets the Sofía and Lupe failures: change the wording instead of repeating or trimming. Only add it on those turns, so normal turns stay natural.

3. **Make the endearments a trait in character data, not a default.** Describe each one as "calls people 'mi vida' when moved or teasing" instead of leaving it open. Alternatively, pass the character's last two replies into the turn prompt so they can see what they just said. Either way the tic becomes occasional color instead of filler.

Reply length is fine across all five, so leave it alone. Don Víctor's median of 19 is the longest, but it's not worth a fix.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Sofía (ayuda en la dulcería de su familia) | Dulces Típicos La Gloria, Puebla | hesitant | 9 | 9 | 8 | 6 | 6 | 7.6 | 13 | 12 |
| Don Víctor (jubilado) | Parque Juárez, San Miguel de Allende | improving | 10 | 9 | 8 | 6 | 8 | 8.2 | 7 | 19 |
| Doña Concha (sacristana) | Templo de San Matías Jalatlaco, Oaxaca | english-beginner | 10 | 9 | 9 | 6 | 8 | 8.4 | 17 | 14 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | english-beginner | 10 | 10 | 8 | 7 | 10 | 9.0 | 8 | 14 |
| Doña Lupe (quesadillera) | Quesadillas Doña Lupe, Ciudad de México | hesitant | 10 | 10 | 8 | 7 | 10 | 9.0 | 7 | 10 |


## How this test works

1. **Sample.** Random characters from the city files (one per city), each at their own place.
2. **Simulate.** Claude plays a learner for 6 turns. The character's replies come from `lib/turn.ts`, the same code the app uses, so this is the real prompt.
3. **Grade.** A separate Claude call reads each transcript and scores the character 1–10 (10 = a native speaker would find it entirely natural):
   - **language**: Speaks Spanish. Uses English only when the learner asks for it, and only as much as the character's English allows, then returns to Spanish.
   - **understands**: Understands imperfect speech. Reads garbled speech-to-text and learner errors as what they meant, without commenting on them.
   - **adapts**: Adapts when the learner is lost. Talking fast or in complex Spanish is fine (real people do); what matters is that when the learner signals confusion the character slows down and rephrases, and when they ask to repeat, repeats.
   - **alive**: Feels like a real person in that place. Distinct personality, reacts to what was said, recasts mistakes naturally instead of teaching.
   - **regional**: Uses Mexican Spanish. Avoids Spain Spanish markers like vosotros, vale, coger (for "take"), ordenador, zumo. Uses Mexican vocabulary and expressions.
4. **Measure length.** Counted, not graded: words in the opener, median and longest reply, share of replies over 30 words, questions per reply, and share asking more than one question (several threads at once). Yardstick: real conversational turns run about 1–2 seconds, roughly 5–10 words (Heldner & Edlund 2015; Stivers et al. 2009). These are measurements only; nothing is sent to the characters.
5. **Recommend.** One more call reads all the grades and lengths and suggests up to 3 changes. Nothing is changed automatically.

**Learner types**

- **english-beginner**: An American beginner (A1). Short, simple sentences. Typical mistakes: wrong article gender, English word order, mixing formal/informal (usted/tú). Some lines arrive garbled by speech-to-text.
- **hesitant**: A nervous beginner (A1). Hesitates ("ehm... yo... "), sometimes says "repite por favor" or "más lento", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").
- **improving**: A learner around A2 who has been in Mexico a few weeks. Uses past tense and longer sentences with occasional errors. Curious and chatty; asks the character about themselves and the neighbourhood.
- All learners are told to be honest: when a line is too fast or complex for their level, they say so instead of pretending to follow.

**Reading the results**

- The sample is small and the conversations are random, so expect grades to move by about half a point between runs with no changes. Look for problems that repeat, not single scores.
- The learner is simulated. It catches clear failures (switching to English, correcting speech-to-text noise, never recovering when the learner is lost) but is no substitute for talking to the characters yourself.
- To compare before and after a change, run both with the same `--seed` (same characters and learners) and compare the grades and length numbers. The learner's lines still vary between runs, so look at clear differences, not small ones.

## Transcripts

### Sofía, Dulces Típicos La Gloria (Puebla) · hesitant · 7.6

_Problem: Sofía is a generic, friendly dispenser of simple lines with no distinct personality or Pueblan shop flavor, and she re-offers 'probar otro dulce' using the very word 'probar' the learner didn't understand earlier._

```
Sofía: ¡Hola! Bienvenido a Dulces Típicos La Gloria. Me llamo Sofía. ¿Cómo te llamas?
Learner: Ehm... hola. Me llamo... Jake. Mucho gusto.
Sofía: ¡Mucho gusto, Jake! Aquí hay muchos dulces ricos. ¿Quieres probar uno?
Learner: Ehm... ¿probar? Sorry... no entiendo. ¿Repite, por favor?
Sofía: ¡Claro! Mira, es un dulce. ¿Quieres comer un dulce?
Learner: Ah... sí, sí. Ehm... ¿qué es... eso? ¿Es camote?
Sofía: ¡Sí, Jake, es camote! Es un dulce típico de Puebla. Toma, es para ti.
Learner: Ah... gracias. Ehm... ¿es... dulce? Sorry... ¿cuánto es?
Sofía: ¡Sí, es muy dulce! Y no es nada, Jake. Es un regalo.
Learner: Ehm... ¿regalo? Perdón, no entiendo. ¿Más despacio, por favor?
Sofía: ¡Claro, Jake! Despacio. Es gratis. No pagas. Es para ti.
Learner: Ah... gratis. ¡Gracias, Sofía! Ehm... muy amable.
Sofía: ¡De nada, Jake! Me alegra que te guste. ¿Quieres probar otro dulce?
```

### Doña Concha, Templo de San Matías Jalatlaco (Oaxaca) · english-beginner · 8.4

_Problem: Doña Concha is polite but generic, with little sacristana personality or Oaxacan/Jalatlaco local color, and she mostly answers in short, flat statements without asking anything back or adding anything specific._

```
Doña Concha: ¡Buenos días! Bienvenido a la iglesia de San Matías. Yo soy Doña Concha. ¿Cómo se llama usted?
Learner: Buenos días, Doña Concha. Me llamo Jake, mucho gusto.
Doña Concha: Mucho gusto, Jake. Yo cuido esta iglesia. ¿Es su primera visita?
Learner: Sí, es mi primero visita. Me gusta la iglesia, es muy bonito.
Doña Concha: Gracias, Jake. Sí, es una iglesia muy bonita. ¡Bienvenido a Jalatlaco!
Learner: Gracias, Doña Concha. ¿Tú puedes... usted puede decir más de la iglesia, por favor?
Doña Concha: Sí, con gusto, Jake. Esta iglesia es muy antigua. Aquí rezamos todos los días.
Learner: Perdón, ¿qué es "rezamos"? ¿Puede repetir más despacio, por favor?
Doña Concha: Claro, Jake. Rezar es hablar con Dios. Aquí... rezamos... todos los días.
Learner: Ah, entiendo. Rezar es "to pray" en inglés. ¿Usted reza todos los días aquí?
Doña Concha: Sí, Jake, rezo aquí todos los días. Abro la iglesia por la mañana y rezo.
Learner: Ah, usted abre la iglesia por la mañana. ¿A qué hora abre la iglesia?
Doña Concha: La abro a las seis de la mañana, Jake. Es muy temprano, pero me gusta.
```

### Don Víctor, Parque Juárez (San Miguel de Allende) · improving · 8.2

_Problem: Don Víctor sounds generic and flat, answering in short, tidy sentences without reacting personally to the learner's comments or adding any retired-teacher or local color._

```
Don Víctor: Buenas tardes, joven. Qué bonito día, ¿verdad?
Learner: Buenas tardes, señor. Sí, es muy bonito. Yo llegué a San Miguel hace tres semanas y me gusta mucho este parque. ¿Usted viene aquí todos los días?
Don Víctor: Sí, vengo casi todos los días. Me gusta mirar los árboles y la gente. Me llamo Víctor. ¿Y usted?
Learner: Mucho gusto, Don Víctor. Me llamo Sam, y soy de Canadá. ¿Usted nació en San Miguel, o vivió en otra ciudad antes?
Don Víctor: Mucho gusto, Sam. Yo nací en la Ciudad de México. Ahora vivo aquí, en San Miguel. ¿Le gusta el parque?
Learner: Sí, me gusta mucho el parque, es muy tranquilo. ¿Por qué usted se mudó de la Ciudad de México a San Miguel?
Don Víctor: Porque aquí hay mucha calma, mucho arte y mucha historia. La ciudad grande es muy ruidosa. Aquí puedo pensar.
Learner: Entiendo, es muy diferente. ¿Usted trabajó en la Ciudad de México antes de ser jubilado?
Don Víctor: Sí, trabajé muchos años en una escuela. Era maestro de historia. Ahora descanso y miro los árboles.
Learner: ¡Qué interesante! Yo también pienso que la historia es muy importante. ¿Usted conoce bien la historia de San Miguel?
Don Víctor: Sí, un poco. San Miguel tiene una historia muy bonita. Mire, la iglesia rosada está allí, cerca del parque.
Learner: ¡Sí, la veo! Es muy bonita. Ayer yo caminé por el centro y saqué muchas fotos de la iglesia. ¿Usted puede contarme una historia de San Miguel?
Don Víctor: Sí, con gusto. Un hombre se llamaba Zeferino. Él hizo la iglesia rosada. Dibujó la iglesia en la tierra con un palo.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · english-beginner · 9.0

_Problem: Doña Chuy is warm but generic, with little personality beyond repeated 'mi vida', and she makes a grammar slip herself ('Me da gusto que le gusta' instead of 'guste')._

```
Doña Chuy: ¡Hola, mi vida! Pásele, siéntese aquí. ¿Tiene hambre?
Learner: Hola. Sí, yo tengo mucho hambre. ¿Qué es la comida hoy?
Doña Chuy: ¡Qué bueno, mi vida! Hoy hay pollo con arroz. ¿Le sirvo un plato grande?
Learner: Sí, un plato grande, por favor. ¿Y tiene una agua?
Doña Chuy: ¡Claro que sí, mi vida! Le traigo su agua fría. Ahorita le sirvo su pollo con arroz.
Learner: Gracias, señora. El pollo huele muy bueno.
Doña Chuy: ¡Gracias, mi vida! Aquí tiene su plato. Coma, coma, que le doy más arroz.
Learner: Gracias. Mmm, el pollo está muy rico. ¿Tú cocinas todo los días?
Doña Chuy: ¡Sí, mi vida, todos los días! Me da gusto que le gusta mi pollo. ¿Quiere más arroz?
Learner: Sí, un poco más arroz, por favor. Está muy bueno.
Doña Chuy: ¡Cómo no, mi vida! Aquí tiene, bien servido. Coma todo, ¿eh?
Learner: Gracias, señora. ¿Cuánto es la comida?
Doña Chuy: Son ochenta pesos, mi vida. El agua va incluida. Pague cuando termine, con calma.
```

### Doña Lupe, Quesadillas Doña Lupe (Ciudad de México) · hesitant · 9.0

_Problem: When asked to repeat more slowly, she only trimmed the sentence and dropped the question, without really rephrasing in simpler words or using gestures, and her warm 'mi cielo' filler feels a bit repetitive._

```
Doña Lupe: ¡Hola, buenas tardes! Bienvenido. ¿Qué te sirvo?
Learner: Ehm... hola. Ehm... yo quiero... una quesadilla, por favor.
Doña Lupe: ¡Claro que sí, con gusto! Te la preparo ahorita. ¿De queso?
Learner: Sí... de queso, por favor. Ehm... gracias.
Doña Lupe: ¡De nada, mi cielo! Ya está en el comal. Un momentito.
Learner: Ehm... sí, okay. Ehm... gracias.
Doña Lupe: Ya casi está, mi cielo. El queso se está derritiendo. ¿Verdad que huele rico?
Learner: Ehm... perdón, no entiendo. ¿Repite, por favor? Más lento.
Doña Lupe: ¡Claro, mi cielo! Ya casi está. Huele rico.
Learner: Ehm... sí. Huele... rico. Ehm... gracias.
Doña Lupe: ¡Muy bien, mi cielo! Aquí está tu quesadilla. Está caliente.
Learner: Ehm... gracias. ¿Cuánto es, por favor?
Doña Lupe: Son treinta pesos, mi cielo. Treinta.
```
