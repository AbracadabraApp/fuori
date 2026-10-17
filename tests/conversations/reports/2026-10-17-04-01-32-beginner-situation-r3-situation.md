# Conversation test

2026-10-17 04:01 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation" · 5 conversations · 6 learner turns each

## Grade: 8.3 / 10

| Criterion | Average |
|---|---|
| language | 8.6 |
| understands | 9.4 |
| adapts | 8.2 |
| alive | 6.6 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 9 |
| Reply (median words) | 13 |
| Reply (average words) | 13 |
| Longest reply (words) | 23 |
| Replies over 30 words | 0% |
| Questions per reply | 0.6 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. Characters are generic and flat: they echo the learner and ask stock follow-ups instead of bringing their own life. "Sí, la comida de Oaxaca es muy rica. Aquí hay mole y tlayudas. ¿Qué comida le gusta?" (Don Arturo, Oaxaca). Beto's "¡Suban, por favor!" repeated three times is the same issue.
2. Little or no personal detail or local color. The Don Arturo in CDMX never says anything about himself or the terminal: "En mi barrio hay tacos muy buenos. ¿Le gustan los tacos?"
3. When a learner asks for help in English, the character stays in Spanish: "Calientito es caliente. El pollo y el arroz están calientes." (Doña Chuy, after "Sorry, what?"). This showed up once, but it's the only case where the learner explicitly asked for something and didn't get it.

## Recommendations

1. **Give each character a few specific, lived-in details in the character data, not rules in the prompt.** For each one, add 3-4 concrete facts: a grievance, a habit, a name, a story they like to tell (Beto's cousin who drives the other cab, Don Arturo's years at the railway, the bench he always sits on). Add one line to character.md like "Bring up your own life and opinions as often as you ask questions." Length is fine (median 10-13 words), so this adds content without making turns longer.

2. **Make characters volunteer something instead of mirroring.** In character.md, add something short like "Don't just answer and hand the question back. Sometimes say something about yourself and let the learner pick it up." This targets the echo-and-ask pattern in both Don Arturos and the repeated "Suban, por favor" from Beto, without adding length rules.

3. **In build-turn-prompt.ts, pass a signal when the learner writes or speaks English asking for help** (e.g., "Sorry, what?"), with a note: "The learner asked for help in English. Give a very short English gloss, then continue in Spanish." This responds to what the learner showed, and nothing changes for learners who aren't lost.

Daniela is doing well. The stock jokes and unrecast gender errors are minor, and her tú/usted switch is natural, so no changes are needed there.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 8 | 9 | 8 | 5 | 8 | 7.6 | 9 | 10 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 6 | 9 | 7 | 8 | 9 | 7.8 | 6 | 11 |
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 9 | 8.2 | 9 | 13 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 9 | 6 | 8 | 8.6 | 7 | 13 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 9 | 8 | 9 | 9.2 | 13 | 16 |


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

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 7.6

_Problem: Beto reads like a scripted phrasebook taxi driver: he repeats "Suban, por favor" three times, has no distinct personality, and the small talk and local color of a San Miguel cabbie are missing._

```
Beto: ¡Hola, buenas tardes! Me llamo Beto. ¿Necesita un taxi?
Learner: Hola, buenas tardes. Sí, yo necesito un taxi por favor.
Beto: ¡Claro que sí! Mi taxi está aquí. ¿Adónde va?
Learner: Yo quiero ir a el Mercado de Artesanías, por favor.
Beto: ¡Perfecto! Está cerca. Suba, por favor. ¿Cuántas personas?
Learner: Somos dos personas. Mi amiga y yo.
Beto: ¡Muy bien! Dos personas. Aquí está mi taxi. Suban, por favor. ¿Dónde está su amiga?
Learner: Mi amiga está allí. Ella es... um, ¿cómo se dice "coming"?
Beto: Se dice "viene". Ella viene. ¡Sí, la veo! Suban, por favor.
Learner: Ah, gracias. Ella viene. ¿Cuánto cuesta el taxi, por favor?
Beto: Son setenta pesos. Es un precio fijo. ¡Suban, por favor!
Learner: Okay, setenta pesos. Está bien. Gracias, Beto.
Beto: ¡De nada! Ahora vamos al Mercado de Artesanías. Es un lugar muy bonito.
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.2

_Problem: Don Arturo is pleasant but generic: he mostly echoes the learner and asks follow-up questions without adding personal stories, local color, or any distinct personality as a retired man in the Zócalo._

```
Don Arturo: ¡Buenas tardes! Qué bonito día en el Zócalo, ¿verdad?
Learner: Ehm... buenas tardes. Sí... es, ehm... bonito.
Don Arturo: Sí, muy bonito. Me llamo Arturo. ¿Y usted?
Learner: Ehm... me llamo Sam. Mucho gusto, ehm... Don Arturo.
Don Arturo: Mucho gusto, Sam. Bienvenido a Oaxaca. Aquí me gusta sentarme y mirar la plaza.
Learner: Ehm... sí, la plaza es... muy bonita. Ehm... ¿usted vive... aquí?
Don Arturo: Sí, vivo aquí, cerca del Zócalo. Vengo todos los días. ¿Y usted, Sam?
Learner: Ehm... yo... soy de Estados Unidos. Ehm... estoy aquí... ehm... una semana.
Don Arturo: Ah, de Estados Unidos. Una semana, qué bien. ¿Le gusta Oaxaca?
Learner: Sí, ehm... me gusta Oaxaca. Ehm... la comida es... muy buena.
Don Arturo: Sí, la comida de Oaxaca es muy rica. Aquí hay mole y tlayudas. ¿Qué comida le gusta?
Learner: Ehm... me gusta... ehm... las tlayudas. ¿Y usted?
Don Arturo: A mí también me gustan las tlayudas. Pero me gusta más el mole negro.
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.6

_Problem: Don Arturo is polite but generic, answering each question briefly with little personality or local color, and he never adds anything about himself, the terminal, or the neighborhood beyond stock facts._

```
Don Arturo: ¡Buenas tardes! Bienvenido. ¿A dónde va usted?
Learner: Buenas tardes, Don Arturo. Quiero ir a Puebla, porque mi amigo vive allá y yo visité su casa el año pasado, ¿hay un autobús ahora?
Don Arturo: ¡Qué bien! Sí, hay un autobús a Puebla en veinte minutos. ¿Un boleto?
Learner: Sí, un boleto, por favor. ¿Cuánto cuesta, y usted vive cerca de la terminal?
Don Arturo: Son doscientos veinte pesos. Y sí, vivo cerca de aquí. Su boleto, por favor.
Learner: Gracias, Don Arturo. ¿Usted trabaja aquí todos los días, y qué hay de bueno en su barrio?
Don Arturo: Sí, trabajo aquí casi todos los días. En mi barrio hay tacos muy buenos. ¿Le gustan los tacos?
Learner: Sí, me gustan mucho los tacos. La semana pasada comí tacos al pastor y fueron muy ricos, ¿cuál taquería es la mejor en su barrio?
Don Arturo: ¡Qué bueno! Mi taquería favorita es El Paisa, aquí a dos calles. Los tacos al pastor son muy ricos.
Learner: Ah, El Paisa, gracias. ¿Tengo tiempo para ir antes del autobús, o está muy lejos?
Don Arturo: Está cerca, a cinco minutos caminando. Pero mire la hora en su boleto.
Learner: Ah, sí, el autobús sale en veinte minutos. Entonces voy rápido a El Paisa, ¿verdad?
Don Arturo: Sí, vaya rápido. Cinco minutos para ir y cinco para volver. Tiene tiempo.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 7.8

_Problem: When the learner asked 'Sorry, what?' in English, Doña Chuy stayed in Spanish and never gave a brief English gloss, even though the learner had signaled they needed help in English._

```
Doña Chuy: ¡Hola, bienvenido! Pase, pase. ¿Tiene hambre?
Learner: Ehm... hola. Sí... yo... tengo hambre. ¿Qué... ehm... qué hay?
Doña Chuy: ¡Qué bueno! Hoy hay pollo con arroz. Está muy rico. ¿Quiere un plato?
Learner: Ehm... sí, por favor. Pollo... con arroz, sí.
Doña Chuy: ¡Perfecto! Siéntese aquí, yo le sirvo. Le doy un plato grande.
Learner: Ehm... gracias. ¿Cuánto... cuesta?
Doña Chuy: Son sesenta pesos. Incluye agua y tortillas. ¿Está bien?
Learner: Ehm... sesenta pesos... sí, está bien. Gracias.
Doña Chuy: ¡Muy bien! Aquí tiene su plato. Está calientito. ¡Que le aproveche!
Learner: Ehm... gracias. Perdón, "calientito"... ¿qué es? Sorry, what?
Doña Chuy: Calientito es caliente. El pollo y el arroz están calientes. ¡Cuidado, mijo, quema un poquito!
Learner: Ehm... ah, caliente, ok. ¿"Quema"? Perdón, no entiendo.
Doña Chuy: ¡Ay, ay, ay! Quema es: muy caliente, duele un poco. Coma despacito, mijo.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.2

_Problem: Daniela's jokes are a bit stock and she never recasts the learner's gender errors (el medicina, el caja), though that is not a big flaw; she also switches the learner's usted to tú without acknowledgement, which is natural._

```
Daniela: Hola, buenas tardes. Hoy no hay fila. ¡Qué suerte! ¿En qué te ayudo?
Learner: Hola, buenas tardes. Yo necesito el medicina para dolor de cabeza, por favor.
Daniela: Claro. Estás en el lugar correcto. Tengo pastillas para el dolor de cabeza. ¿Te duele mucho?
Learner: Sí, me duele mucho. Es muy fuerte desde la mañana.
Daniela: Uy, lo siento mucho. Aquí tengo unas pastillas buenas. No es magia, pero casi. ¿Tomaste agua hoy?
Learner: Sí, yo tomo agua, pero no mucho. ¿Usted tiene las pastillas?
Daniela: Sí, aquí están. Toma una pastilla con un vaso grande de agua. El agua es gratis, es mi medicina favorita. ¿Quieres una caja?
Learner: Sí, una caja, por favor. ¿Cuánto es el caja?
Daniela: La caja cuesta 45 pesos. Es barata, y el dolor de cabeza es caro. ¿Pagas en efectivo o con tarjeta?
Learner: Con tarjeta, por favor. Aquí está el tarjeta.
Daniela: Gracias. Pon la tarjeta aquí, en la máquina. Es un poco lenta, pero tranquila.
Learner: Ok, gracias. ¿Aquí está bien?
Daniela: Sí, ahí está bien. Ahora esperamos un momento. La máquina piensa mucho, como yo los lunes.
```
