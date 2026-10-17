# Conversation test

2026-10-17 18:37 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, ask" · 5 conversations · 6 learner turns each

## Grade: 8.5 / 10

| Criterion | Average |
|---|---|
| language | 9.8 |
| understands | 9.6 |
| adapts | 8.0 |
| alive | 6.8 |
| regional | 8.2 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 10 |
| Reply (median words) | 17 |
| Reply (average words) | 16.1 |
| Longest reply (words) | 26 |
| Replies over 30 words | 0% |
| Questions per reply | 1 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
1. **Repeated phrases and closing tics.** The same line or question shape comes back across turns: "¿Lo quiere, sí o no?", "Perfecto. Yo soy Arturo. Mucho gusto." (said after already introducing himself), "Yo conozco todas las calles" (twice), and Beto always ending on an either/or question.
2. **Flat, generic characters with little local color.** Don Arturo (CDMX) and Beto give minimal detail and show no curiosity about the learner. The Oaxaca Arturo and Beto could be set in any city. Quote: "Aquí se está muy bien."
3. **Weak repair when the learner is lost.** Asked to repeat "hielo," Doña Chuy glossed the word instead of repeating simply: "Hielo es esto: frío, frío. Mira, para la limonada. ¿Sí o no?"

## Recommendations
1. **Give each character a few specifics in the character data, not rules in the prompt.** Add 2–3 concrete details per character: something on their mind today, a strong opinion, a named local place or habit (a specific San Miguel street or hill for Beto, a Oaxacan retiree's market or mezcal opinion for Arturo). This fixes the flatness and gives them something new to say instead of recycling lines. Daniela scored 9 on alive and regional, so compare her data and copy whatever she has that the others lack.
2. **In `build-turn-prompt.ts`, make sure the character's own previous turns are in the history, and add a short state note.** For example: "You've already introduced yourself" once that's true. This should stop the repeated introductions and recycled lines without adding style rules. If the "¿sí o no?" tic persists after this, check whether it appears in the character data's example lines, since the model may be copying it.
3. **Add a conditional repair cue to the turn prompt.** When the learner asks for repetition or says they don't understand, add one line: "The learner didn't catch that. Say it again, shorter, then stop." This matches the "better response when the learner is lost" case and would have produced "¿Con hielo? ¿Hielo en la limonada?". It also helps length, since median replies of 15–19 words run above the ~10-word norm, though none are long enough to need a separate fix.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 7 | 7.8 | 16 | 19 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 8 | 6 | 8 | 8.2 | 8 | 18 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 8 | 8.4 | 10 | 10 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 10 | 10 | 7 | 7 | 9 | 8.6 | 8 | 15 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 9 | 9 | 9 | 9.4 | 10 | 17 |


## How this test works

1. **Sample.** Random characters from the city files (one per city), each at their own place.
2. **Simulate.** Claude plays a learner for 6 turns. The character's replies come from `lib/turn.ts`, the same code the app uses, so this is the real prompt.
3. **Grade.** A separate Claude call reads each transcript and scores the character 1–10 (10 = a native speaker would find it entirely natural):
   - **language**: Speaks Spanish. Uses English when the learner asks for help (in English or in Spanish), as much as the help takes, then returns to Spanish; no English nobody asked for.
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

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.2

_Problem: Don Arturo is functional but flat: he answers the learner's personal questions with minimal detail and no curiosity or local color, and repeats the odd tic "¿sí o no?"._

```
Don Arturo: ¡Buenas tardes! ¿Va de viaje, sí o no?
Learner: Buenas tardes, sí, voy a Puebla. ¿Usted trabaja aquí todos los días? Yo llegué a México hace unas semanas y todo es nuevo para mí.
Don Arturo: Sí, trabajo aquí todos los días. ¡Bienvenido a México! Puebla es bonito. ¿Quiere el boleto para hoy o para mañana?
Learner: Para hoy, por favor. ¿Cuánto cuesta el boleto y a qué hora sale el próximo autobús?
Don Arturo: El boleto cuesta doscientos treinta pesos. El próximo autobús sale a las cinco. ¿Lo quiere, sí o no?
Learner: Sí, lo quiero, por favor. ¿Puedo pagar con tarjeta o solo con efectivo?
Don Arturo: Sí, puede pagar con tarjeta. Aquí aceptamos las dos cosas. ¿Va a pagar con tarjeta o con efectivo?
Learner: Con tarjeta, por favor. ¿Y usted vive cerca de la terminal? Yo vivo en la Roma y me gusta mucho, pero es un poco ruidoso.
Don Arturo: Vivo lejos, en Iztapalapa. La Roma es bonita, pero sí, ¡hay mucho ruido! Ponga la tarjeta aquí, por favor. ¿Quiere ventana o pasillo?
Learner: Ventana, por favor. ¿Usted va a su casa en metro todos los días? Yo ayer tomé el metro por primera vez y fue muy interesante.
Don Arturo: Sí, voy en metro todos los días. ¡Qué bueno que le gustó! Su boleto: ventana, autobús a las cinco, andén cuatro. ¿Todo bien?
Learner: Sí, todo bien, gracias. ¿Y dónde está el andén cuatro? ¿Está cerca de aquí?
Don Arturo: Sí, está cerca. Vaya derecho, por esa puerta. El andén cuatro está a la izquierda. ¿Ve la puerta?
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 7.8

_Problem: Don Arturo re-introduces himself ('Yo soy Arturo. Mucho gusto.') after already doing so, and he sometimes leaves out natural Mexican flavor, so he feels slightly scripted instead of a distinct Oaxacan retiree._

```
Don Arturo: ¡Buenas tardes! Me llamo Arturo. Me gusta este lugar. ¿Es su primera vez en el Zócalo?
Learner: Ehm... buenas tardes. Yo... me llamo Sam. Sí, ehm... primera vez.
Don Arturo: Mucho gusto, Sam. ¡Qué bueno! Yo vengo aquí todos los días. Hay música, árboles y mucha gente. ¿Le gusta la plaza?
Learner: Ehm... sí, me gusta. Es... ehm... muy bonita.
Don Arturo: Sí, es muy bonita. Y por la tarde, está tranquila. Yo siempre me siento en esa banca, bajo el árbol. ¿Prefiere el sol o la sombra?
Learner: Ehm... perdón, no entiendo. ¿Repite, por favor? Más lento.
Don Arturo: Claro, Sam. Con calma. ¿Sol, o sombra? Yo prefiero la sombra.
Learner: Ehm... sombra. Yo... prefiero... ehm... la sombra también.
Don Arturo: ¡Muy bien, Sam! Entonces, somos dos. Hay una banca libre allí, con sombra. ¿Nos sentamos?
Learner: Ehm... sí, gracias. ¿Nos... sentamos? Sí, ehm... vamos.
Don Arturo: Perfecto. Yo soy Arturo. Mucho gusto. Aquí se está muy bien. ¿Usted tiene sed? ¿Quiere agua o un helado?
Learner: Ehm... sí, gracias. Ehm... agua, por favor.
Don Arturo: Muy bien, agua para usted. Yo tomo un helado, pero no le digo a mi doctor. Hace calor hoy, ¿verdad?
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.4

_Problem: Beto feels generic and repetitive (says 'Yo conozco todas las calles' twice, always ends with an either/or question) and offers little San Miguel-specific local color or personality._

```
Beto: ¡Hola, buenas! Soy Beto. ¿Necesitas un taxi, sí o no?
Learner: Hola Beto. Sí, yo necesito un taxi, por favor.
Beto: ¡Perfecto! Yo conozco todas las calles. ¿Vas cerca o lejos?
Learner: Cerca, creo. Yo quiero ir a el mercado, por favor.
Beto: ¡Muy bien! El mercado está cerca. Yo soy rápido. ¿Mercado de comida o de artesanías?
Learner: Mercado de artesanías, por favor. ¿Cuánto cuesta?
Beto: ¡Claro! Son setenta pesos. ¡Barato y rápido! ¿Está bien?
Learner: Sí, está bien. Setenta pesos, ¿correcto? Gracias, Beto.
Beto: ¡Correcto! De nada. Sube, vamos. ¿Es tu primera vez aquí?
Learner: Sí, es mi primera vez. Me gusta mucho San Miguel.
Beto: ¡Qué bueno! San Miguel es muy bonito. Yo conozco todas las calles. ¿Te gustan los colores o la comida?
Learner: Me gustan los dos. Los colores son muy bonitos, y la comida es delicioso.
Beto: ¡Sí! La comida aquí es deliciosa. Yo amo los tacos. ¿Te gustan los tacos o prefieres el helado?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.4

```
Daniela: ¡Hola! Soy Daniela. ¿Buscas medicina o solo el aire acondicionado?
Learner: Hola, Daniela. Busco medicina para el dolor de la cabeza, por favor.
Daniela: Ay, pobre cabeza. Sí, tengo pastillas. ¿Te duele mucho o poco?
Learner: Me duele mucho. Es muy fuerte hoy.
Daniela: Uy, lo siento. Tengo una pastilla buena para eso. Primero, ¿tomaste agua hoy, sí o no?
Learner: No, no tomé agua hoy. Solo café.
Daniela: Ajá, ya sé qué pasó. El café no es agua, aunque sea muy popular. Te doy la pastilla y también agua, ¿sí?
Learner: Sí, gracias. ¿Cuánto es, por favor?
Daniela: Son 45 pesos. El agua es gratis, hoy es tu día de suerte. ¿Pagas con efectivo o con tarjeta?
Learner: Con tarjeta, por favor. Gracias por el agua.
Daniela: De nada. Mira, la máquina está aquí. Pon tu tarjeta, por favor. ¿Quieres bolsa, sí o no?
Learner: No, gracias. No quiero la bolsa.
Daniela: Perfecto, una bolsa menos. Aquí está tu pastilla. Tómala con el agua, no con el café. ¿Sí?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.6

_Problem: When the learner asked for repetition on 'hielo', she didn't actually repeat or rephrase the question simply; she explained the word with a vague gloss ('frío, frío') and 'Mira' pointing at nothing, rather than a slower, simpler repeat like '¿Con hielo? ¿Hielo en la limonada?'._

```
Doña Chuy: ¡Buenas tardes, mi vida! Pásale, siéntate. ¿Tienes hambre?
Learner: Ehm... buenas tardes. Sí... yo... tengo hambre.
Doña Chuy: ¡Qué bueno, mi vida! Aquí vas a comer rico. Hoy hay pollo y hay sopa. ¿Quieres pollo o sopa?
Learner: Ehm... pollo, por favor. Gracias.
Doña Chuy: ¡Perfecto, mi vida! Pollo con mucho arroz, yo te sirvo bien. ¿Quieres tortillas?
Learner: Ehm... sí, tortillas, por favor.
Doña Chuy: ¡Ándale, mi vida! Siéntate, ya te llevo todo. Y te doy muchas tortillas, ¡aquí nadie se queda con hambre! ¿Quieres agua o limonada?
Learner: Ehm... limonada, por favor.
Doña Chuy: ¡Limonada fresquita, mi vida! Hoy hace mucho calor. ¿Con hielo?
Learner: Ehm... ¿hielo? Perdón... ¿repite, por favor?
Doña Chuy: ¡Claro, mi vida! Hielo es esto: frío, frío. Mira, para la limonada. ¿Sí o no?
Learner: Ehm... ah, sí. Sí, con hielo, por favor.
Doña Chuy: ¡Muy bien, mi vida! Ya te traigo tu pollo, tus tortillas y tu limonada con hielo. ¡Siéntate, siéntate!
```
