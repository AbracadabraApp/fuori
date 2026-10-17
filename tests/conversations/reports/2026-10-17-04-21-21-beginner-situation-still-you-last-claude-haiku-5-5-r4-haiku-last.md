# Conversation test

2026-10-17 04:21 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.3 / 10

| Criterion | Average |
|---|---|
| language | 8.8 |
| understands | 9.2 |
| adapts | 7.8 |
| alive | 7.2 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 9 |
| Reply (median words) | 17 |
| Reply (average words) | 17.9 |
| Longest reply (words) | 34 |
| Replies over 30 words | 3% |
| Questions per reply | 0.7 |
| Replies asking 2+ questions | 9% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run about twice as long as natural turns.** Median replies are 17-27 words, and one character's longest reply was 34. Example: "Sí, me gusta mucho. Aquí paso las tardes. Hay música, gente y palomas."
2. **A lost learner doesn't get a useful answer.** Doña Chuy answered an English "what does pican mean?" with more Spanish: "Pica... quema un poquito en la boca."
3. **Characters drift out of role or go generic.** Daniela says "Lea la caja, por favor" instead of recommending a medicine. Beto says "Pare aquí" as if the passenger were driving.

## Recommendations

1. **Add a turn-shape line to `character.md`, and repeat it in `build-turn-prompt.ts`.** Something like: "Talk like a person in a conversation: usually one short sentence, two at most, then let them answer." This limits how much they say, not how fast or complex the Spanish is. The model drifts longer as the conversation goes on, so the per-turn reminder matters more than the one in the main prompt.

2. **Add a rule for when the learner asks for help.** In `character.md`, add: "If the learner asks in English what something means, or clearly doesn't understand, give a quick English gloss, then go back to Spanish in character." This only triggers when the learner shows they're lost. Doña Chuy's adapts score of 5 suggests it's needed, and it doesn't make the characters easier by default.

3. **Add two or three concrete job facts to each character's data.** Examples: Daniela recommends a specific medicine and gives the dose. Beto is the one driving and stops the car himself. Don Arturo has a particular bench, a regular he gossips about, or a Oaxacan dish he's opinionated about. Specific facts fix both the out-of-role moments and the generic feel. The "los talavera" slip is a one-off, so don't prompt around it.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 6 | 9 | 5 | 8 | 9 | 7.4 | 8 | 17 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 10 | 8 | 6 | 8 | 8.2 | 12 | 17 |
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 9 | 7 | 8 | 8.4 | 11 | 19 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 9 | 9 | 7 | 8 | 8.6 | 9 | 17 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 8 | 8 | 9 | 8.8 | 5 | 27 |


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

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.4

_Problem: Don Arturo is pleasant and adaptive but a bit generic and does not add much distinct local color or personality beyond the pigeon anecdote._

```
Don Arturo: ¡Buenas tardes! Qué bonito día para estar en el zócalo, ¿verdad?
Learner: Ehm... buenas tardes. Sí, es... muy bonito.
Don Arturo: ¡Qué bien que le guste! Aquí es muy bonito. ¿Es su primera vez en Oaxaca?
Learner: Ehm... sí. Es mi primera... vez. Yo... soy de Estados Unidos.
Don Arturo: ¡Qué bien! Bienvenido a Oaxaca. Yo nací aquí, en el centro. Tengo setenta y tres años. ¿Le gusta la ciudad?
Learner: Ehm... sí, me gusta mucho. Ehm... ¿usted... vive aquí? Perdón, no entiendo todo.
Don Arturo: No se preocupe. Sí, yo vivo aquí, en el centro. Es mi casa desde hace muchos años. ¿Y usted vive en qué ciudad de Estados Unidos?
Learner: Ehm... yo vivo en... Chicago. ¿Usted... ehm... le gusta... el zócalo?
Don Arturo: Sí, me gusta mucho. Aquí paso las tardes. Hay música, gente y palomas. Y las palomas son muy atrevidas.
Learner: Ehm... perdón. ¿Qué es "atrevidas"? No entiendo.
Don Arturo: Atrevidas significa que no tienen miedo. Se acercan mucho a las personas. Mire, aquella paloma quiere mi pan.
Learner: Ah, okay... ehm... la paloma quiere... el pan. Ja, ja. ¿Usted... ehm... tiene hambre?
Don Arturo: Ja, ja. No tengo hambre, pero la paloma sí. Ella es muy insistente. Yo le doy un poquito de pan cada tarde.
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.8

_Problem: Minor slip: "los talavera" should be "la talavera" (or "las piezas de talavera"), and the character never has to adapt because the learner never signals confusion._

```
Don Arturo: ¡Buenos días! ¿Va para Puebla?
Learner: Buenos días. Sí, voy a Puebla. ¿A qué hora sale el próximo autobús, por favor?
Don Arturo: ¡Qué bien! El próximo sale a las diez y media. Es un autobús directo, dos horas y media más o menos. ¿Quiere boleto de ida nada más?
Learner: Sí, solo de ida, por favor. Ayer visité el centro y fue muy bonito, pero hoy quiero conocer Puebla.
Don Arturo: ¡Qué bueno! El centro es muy bonito. Puebla también es muy bonita. Aquí tiene su boleto, son doscientos cincuenta pesos. ¿Paga en efectivo?
Learner: Sí, pago en efectivo. Aquí tiene. ¿Usted es de la Ciudad de México, Don Arturo?
Don Arturo: Sí, soy de aquí, de la Ciudad de México. Llevo muchos años vendiendo boletos en este terminal. Aquí tiene su cambio. ¿Es su primera vez en Puebla?
Learner: Sí, es mi primera vez. ¿Usted conoce Puebla? ¿Qué me recomienda visitar?
Don Arturo: Sí, la conozco bien. Es mi ciudad favorita después de la nuestra. Le recomiendo el Zócalo, la Catedral y los chiles en nogada, en temporada. Y no se pierda los talavera, son muy bonitos.
Learner: Gracias, Don Arturo. ¿Qué es "chiles en nogada"? ¿Es muy picante?
Don Arturo: Es un chile relleno con carne y frutas. Tiene salsa de nuez, blanca, y encima granada roja. Los colores son de la bandera. No es muy picante, es suave.
Learner: Ah, entiendo, suena muy rico. ¿Y usted come chiles en nogada en su casa o en un restaurante?
Don Arturo: En restaurante, casi siempre. Son muy trabajosos para hacer en casa. Pero cuando hay fiesta, mi esposa los prepara y yo no me quejo.
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.6

_Problem: Beto tells the learner "Pare aquí" as if the passenger were driving, which is odd for a taxi driver who would stop the car himself, and his lines feel a bit generic and tour-guide-like._

```
Beto: ¡Hola, qué onda! Bienvenido a San Miguel. ¿Necesitas taxi?
Learner: Hola. Sí, yo necesito un taxi, por favor.
Beto: ¡Perfecto! Sube, sube. ¿A dónde vas?
Learner: Yo quiero ir a el Mercado de Artesanías, por favor. ¿Cuánto cuesta?
Beto: ¡Claro! El Mercado de Artesanías está aquí cerca, a cinco minutos. Son cincuenta pesos, más o menos.
Learner: Ok, cincuenta pesos. Está bien, gracias. ¿Es lejos de aquí?
Beto: No, no es lejos. Son cinco minutos. Vamos ya, ¿sí?
Learner: Sí, vamos. Gracias, usted es muy amable.
Beto: ¡De nada! Ya estamos en camino. Mire, aquí a la izquierda está la Parroquia, ¡la torre se ve bonita!
Learner: Ah, sí, la Parroquia es muy bonita. Yo quiero tomar una foto, por favor.
Beto: ¡Claro que sí! Pare aquí un momento, en la esquina. Tome su foto, la torre sale muy bien desde aquí.
Learner: Gracias. Es un iglesia muy bonita. ¿Es muy viejo?
Beto: Sí, es muy vieja, tiene casi trescientos años. Aquí en San Miguel todo es viejo, ¡y todos quieren una foto!
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 7.4

_Problem: When the learner explicitly asked in English what "pican" meant, she only explained in more Spanish ("Pica... quema un poquito") with new unknown words and never gave an English gloss, then kept repeating that pattern for "quema"._

```
Doña Chuy: ¡Ay, buenas! Bienvenido a mi cocina. ¿Tiene hambre?
Learner: Ehm... sí. Yo... tengo hambre.
Doña Chuy: ¡Qué bueno! Siéntese aquí, en esta mesa. Hoy tengo pozole y tamales. ¿Quiere pozole?
Learner: Ehm... pozole... sí, por favor. ¿Qué es... tamales?
Doña Chuy: ¡Ay, los tamales! Son masa de maíz con carne o rajas, envueltos en hoja. Muy ricos. Hoy le doy los dos, ¿eh? Usted come mucho.
Learner: Ehm... perdón. ¿Más despacio, por favor? No entiendo "rajas".
Doña Chuy: Ay, perdón. Rajas son tiras de chile verde. Pican un poquito. ¿Quiere con rajas o con carne?
Learner: Ehm... "pican"... no entiendo. Sorry, what does "pican" mean?
Doña Chuy: Pican es... pica, ¿sabe? Quema un poquito en la boca. Pero no mucho. Usted es fuerte, ¿verdad?
Learner: Ehm... "quema"... no entiendo. Con carne, por favor.
Doña Chuy: Quema es... como fuego en la boca. ¡Ay, qué bueno! Con carne, sí. Aquí le traigo su tamal.
Learner: Ehm... gracias. ¿Y el pozole... también... con carne?
Doña Chuy: Sí, mijo, el pozole también con carne. Es de cerdo, muy rico. Aquí tiene, siéntese.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.2

_Problem: Daniela acts unlike a pharmacist at the end: the customer came to buy headache medicine, but she tells them to read the box and asks which medicine they already have, instead of recommending one and giving the dose._

```
Daniela: ¡Hola! Bienvenido a la Farmacia San Rafael. ¿En qué le puedo ayudar?
Learner: Hola. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro. ¿Le duele mucho la cabeza? ¿Desde cuándo?
Learner: Sí, mucho. Yo tengo dolor de cabeza desde ayer.
Daniela: Ay, desde ayer. Entiendo. ¿Tiene fiebre o náuseas? ¿Algo más le duele?
Learner: No fiebre, pero yo tengo un poco náuseas.
Daniela: Entiendo. Con náuseas y dolor de cabeza, mejor no tome nada en ayunas. ¿Ya comió algo hoy?
Learner: No, yo no como hoy. ¿Qué es "ayunas"?
Daniela: En ayunas quiere decir sin comer nada. Usted no ha comido, entonces todavía no tome la medicina. ¿Puede comer algo ligero, como pan o galletas?
Learner: Sí, puedo comer pan. ¿Y después yo tomo la medicina?
Daniela: Sí, después del pan. Coma poquito y espere un rato. Luego sí, tome la medicina con agua.
Learner: Okay, gracias. ¿Cuántas pastillas yo tomo?
Daniela: Depende de la medicina. Con paracetamol, normalmente una pastilla. Lea la caja, por favor. Ahí dice la dosis. ¿Qué medicina tiene usted?
```
