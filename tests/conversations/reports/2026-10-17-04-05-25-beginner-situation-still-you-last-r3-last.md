# Conversation test

2026-10-17 04:05 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.2 / 10

| Criterion | Average |
|---|---|
| language | 8.8 |
| understands | 9.2 |
| adapts | 7.6 |
| alive | 6.8 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 15 |
| Reply (average words) | 14.8 |
| Longest reply (words) | 22 |
| Replies over 30 words | 0% |
| Questions per reply | 0.4 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
- **Characters feel generic or scripted (alive 6 in three of five runs):** Beto repeats "Yo conozco todas las calles" and tacks on "Jake". CDMX Don Arturo answers and stops: "Son 250 pesos, por favor." Daniela's "Tu dolor es grande, pero el precio es pequeño" is odd for a pharmacist, and she drifts between tú and usted.
- **Small learner mistakes pass without a natural recast:** "a el Mercado" and "El árbol... es frío" got no echo of the correct form ("al Mercado", "el árbol da sombra / está fresco").
- **Repair fails when the learner is clearly lost:** after "sorry, no entiendo", Doña Chuy explains with "Cuidado es: ¡ojo!... lengua quemada", which is more unfamiliar Spanish and no English.

## Recommendations
1. **Add a data-level personality hook per character** (character data, not the prompt rules). Give each a concrete detail, a small stake, and a fixed register toward customers. Examples: Beto has a favorite spot or a story about the route; CDMX Don Arturo knows regulars and the neighborhood; Daniela is always usted or always tú. A concrete detail gives them something specific to say, makes them ask the learner something back, and fixes the register drift.
2. **In `build-turn-prompt.ts`, send the character's last 2–3 lines with a short note:** "Don't reuse phrases you've already said; use the learner's name rarely." This is a context fix rather than a rule on how to talk, and it targets the repeated "yo conozco todas las calles" and the name-tagging directly.
3. **Add one sentence to `character.md`:** "If the learner seems lost, especially if they say so in English, give a quick English gloss of the word, then continue in Spanish. If they make a small mistake, just use the right form naturally in your reply." This covers both the Doña Chuy failure and the missed recasts, and it only changes behavior when the learner shows a need. Native speed and complexity otherwise stay as they are.

Lengths look fine (0% over 30, medians 14–18), so I wouldn't add length rules.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 6 | 9 | 6 | 8 | 9 | 7.6 | 15 | 15 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 9 | 9 | 7 | 6 | 8 | 7.8 | 17 | 14 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 9 | 8 | 6 | 8 | 8.0 | 11 | 14 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 8 | 6 | 9 | 8.6 | 9 | 16 |
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 10 | 9 | 9 | 8 | 9 | 9.0 | 10 | 18 |


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

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 7.8

_Problem: Beto is a bit repetitive and generic (repeats "yo conozco todas las calles" and keeps tacking on the learner's name), and he never reacts to or recasts the learner's small mistakes like "a el Mercado", so he feels more like a script than a distinct taxi driver._

```
Beto: ¡Hola, buenas tardes! Soy Beto. Aquí es mi sitio de taxis, en el Jardín. ¿Cómo te llamas?
Learner: Hola, buenas tardes. Me llamo Jake. Mucho gusto.
Beto: ¡Mucho gusto, Jake! Bienvenido a San Miguel. ¿Necesitas un taxi?
Learner: Sí, necesito un taxi. ¿Cuánto cuesta a el Mercado de Artesanías?
Beto: ¡Claro, Jake! Cuesta setenta pesos. Es cerca, y yo conozco todas las calles. ¿Vamos?
Learner: Sí, vamos. ¿Es setenta pesos para una persona o para dos?
Beto: ¡Es el precio del taxi, Jake! Una persona o cuatro, son setenta pesos. ¡Buen precio, eh!
Learner: Ah, okay. Gracias, Beto. ¿Cuánto tiempo es el viaje?
Beto: Son diez minutos, Jake. ¡Es rápido! Yo conozco todas las calles. Sube, por favor.
Learner: Okay, gracias. ¿Puedo pagar con tarjeta o solo efectivo?
Beto: Solo efectivo, Jake. Lo siento. ¿Tienes pesos?
Learner: Sí, tengo pesos. ¿Pago ahora o después del viaje?
Beto: Después del viaje, Jake. ¡Tranquilo! Primero subimos y yo manejo.
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 9.0

_Problem: Minor: "Aire acondicionado" repeat was followed by a gloss, and Arturo never recasts the learner's "El árbol... es frío" (a small missed chance), but nothing significantly wrong._

```
Don Arturo: ¡Buenas tardes! Esta es mi banca, pero hoy la comparto.
Learner: Ehm... buenas tardes. ¿Perdón... "banca"? No entiendo.
Don Arturo: Ah, perdón. Banca es esto, donde estoy sentado. Es mi banca favorita. Siéntese, por favor.
Learner: Ah... ehm... ¡gracias! Yo... me siento. ¿Es... su banca favorita?
Don Arturo: Sí, es mi favorita. Aquí hay sombra, y veo a todos. ¿Cómo se llama usted?
Learner: Ehm... me llamo Sam. ¿Y... usted? Ehm... ¿"sombra"? No entiendo.
Don Arturo: Mucho gusto, Sam. Me llamo Arturo. Sombra es esto: el árbol tapa el sol. ¡Es mi aire acondicionado!
Learner: Ah... ¡sí! Ehm... mucho gusto, Don Arturo. ¿"Aire acondicionado"... repite, por favor?
Don Arturo: Claro, Sam. Aire... acondicionado. Es aire frío para la casa. Aquí no hay máquina. Solo el árbol y yo.
Learner: Ah... ehm... ¡sí! El árbol... es frío. ¿Usted... vive aquí, en Oaxaca?
Don Arturo: Sí, Sam. Vivo aquí en Oaxaca, cerca del Zócalo. Toda mi vida. Vengo aquí cada tarde. ¿Y usted? ¿De dónde es?
Learner: Ehm... yo soy de... Estados Unidos. ¿"Toda mi vida"... más lento, por favor?
Don Arturo: Estados Unidos, qué bien. Claro, Sam. To-da... mi... vi-da. Es siempre. Nací aquí, y sigo aquí. ¡Y no me voy!
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.6

_Problem: Don Arturo is polite and accurate but fairly generic and flat, with little personality, and he never elaborates or asks the chatty learner anything back about themselves._

```
Don Arturo: Buenas tardes. Bienvenido a la terminal. ¿A dónde va?
Learner: Buenas tardes. Quiero ir a Puebla, por favor. Ayer yo visité el centro aquí y me gustó mucho, pero hoy quiero conocer otra ciudad.
Don Arturo: Qué bueno que le gustó el centro. Puebla también es muy bonita. ¿Quiere salir ahora?
Learner: Sí, quiero salir ahora, por favor. ¿Cuánto cuesta el boleto y cuánto tiempo es el viaje?
Don Arturo: El boleto cuesta 250 pesos. El viaje dura dos horas, más o menos. ¿Paga con efectivo?
Learner: Sí, pago con efectivo. ¿Y usted vive cerca de la terminal? Me gusta mucho este barrio.
Don Arturo: Sí, vivo cerca. El barrio es ruidoso, pero a mí también me gusta. Son 250 pesos, por favor.
Learner: Aquí está, doscientos cincuenta pesos. ¿Hay un restaurante bueno cerca de la terminal? Ayer comí tacos y fueron muy ricos.
Don Arturo: Gracias. Aquí está su boleto. Sí, hay una fonda buena a la vuelta. Yo como allí todos los días.
Learner: Gracias. ¿Qué comida le gusta comer en la fonda? ¿Es barata?
Don Arturo: Me gusta el mole con pollo. Sí, es barato. La señora cocina muy bien.
Learner: Qué rico. Voy a comer allí antes del autobús. ¿A qué hora sale mi autobús y de qué número de andén?
Don Arturo: Su autobús sale a las cuatro y media, en el andén 12. Hay tiempo para el mole.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.0

_Problem: Daniela's lines are stilted and a bit odd, with wordplay that doesn't sound like a real pharmacist, and she switches from tú to usted without a reason._

```
Daniela: Hola, buenas tardes. Estás de suerte: no hay fila. ¿Qué necesitas?
Learner: Hola, buenas tardes. Necesito una medicina para la dolor de cabeza, por favor.
Daniela: Claro, tengo pastillas para el dolor de cabeza. Hoy es un día popular para eso. ¿Te duele mucho?
Learner: Sí, me duele mucho. Es muy fuerte desde la mañana.
Daniela: Ay, lo siento. Ese dolor es muy largo. Un momento, voy por la pastilla.
Learner: Gracias. ¿Cuánto cuesta la pastilla?
Daniela: Cuesta veinte pesos. Es barata. Tu dolor es grande, pero el precio es pequeño.
Learner: Ah, veinte pesos, está bien. Quiero la pastilla, por favor.
Daniela: Aquí está. Es pequeña, pero fuerte. Son veinte pesos, por favor.
Learner: Aquí está el dinero. Gracias, usted es muy amable.
Daniela: De nada. Tome dos pastillas con agua y descanse un poco. Que se mejore pronto.
Learner: Gracias. Adiós, y buenas tardes.
Daniela: Adiós, buenas tardes. Y si no mejora, vuelva mañana. Aquí estoy.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 7.6

_Problem: When the A1 learner said "sorry, no entiendo", Doña Chuy never gave an English gloss and explained with more unfamiliar Spanish, such as "cuidado" = "ojo" followed by "lengua quemada"._

```
Doña Chuy: ¡Buenas tardes, mi vida! Siéntate, siéntate. Hoy hay pozole y está calientito. ¿Quieres un plato?
Learner: Ehm... buenas tardes. ¿Pozole... qué es? Ehm... sorry, no entiendo "calientito".
Doña Chuy: ¡Ay, no te preocupes, mi vida! Calientito es caliente, con cariño. El pozole es una sopa con carne y maíz. ¿Quieres probar?
Learner: Ehm... sí, por favor. Un plato de pozole.
Doña Chuy: ¡Muy bien, mi vida! Siéntate aquí. Te doy un plato grande. Aquí nadie se va con hambre.
Learner: Ehm... gracias. ¿Cuánto... cuánto es, por favor?
Doña Chuy: Son sesenta pesos, mi vida. Es barato, ¿verdad? Primero come, después pagas.
Learner: Ehm... ¿Más lento, por favor? No entiendo "después pagas".
Doña Chuy: Claro, mi vida. Primero comes. Luego pagas. Con calma, aquí no hay prisa.
Learner: Ahh, ok. Ehm... gracias, Doña Chuy. ¿Tiene... agua, por favor?
Doña Chuy: Sí, mi vida. Te traigo agua. Cuidado, el pozole está calientito, o sea, muy caliente.
Learner: Ehm... ok, gracias. ¿"Cuidado"... qué es? Sorry, no entiendo.
Doña Chuy: Cuidado es: ¡ojo! El plato está muy caliente. Despacito, mi vida, que yo no quiero lengua quemada.
```
