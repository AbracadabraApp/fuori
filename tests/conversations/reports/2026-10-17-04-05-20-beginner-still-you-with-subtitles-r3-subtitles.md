# Conversation test

2026-10-17 04:05 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, with subtitles" · 5 conversations · 6 learner turns each

## Grade: 8.7 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.6 |
| adapts | 8.4 |
| alive | 6.8 |
| regional | 9.0 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 9 |
| Reply (median words) | 13 |
| Reply (average words) | 13.9 |
| Longest reply (words) | 23 |
| Replies over 30 words | 0% |
| Questions per reply | 0.5 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
1. **Characters feel generic and flat, with low "alive" scores (6 for Beto and both Don Arturos).** Beto: "¡Barato para un taxista tan simpático!" The taquillero Don Arturo keeps steering back to the transaction: "Pero ahora, su camión sale pronto."
2. **Stock lines, repeated bits and teacher-isms.** Daniela's vacation joke appears three times, and she closes with "La farmacia no se va." Oaxaca's Don Arturo ends with "¡Muy bien!" like a teacher.
3. **Adaptation to a lost learner is modest.** Doña Chuy rephrases a bit more simply but keeps her pace: "Primero come su pozole. Después me da los setenta pesos. Sin prisa."

Length is fine overall: 0% of replies are over 30 words and openers are short. The taquillero Don Arturo runs a little long (median 18, longest 23), but it's not a priority.

## Recommendations
1. **Give each character a few specific particulars in character data.** Add 2-3 concrete, local, personal details per character, such as a pet peeve, a favorite corner, a story or an opinion. Beto might gripe about the cobblestones or have a view on where tourists should eat. Don Arturo might have a regular bench or a rival vendor. Add a want beyond the transaction, so the taquillero has a reason to chat while waiting. This fixes flatness and repeated bits without adding rules, because the model has more to draw from than one joke. Also move Beto's payment to the end of the ride in the scene description.

2. **Add one situational line to character.md.** Something like: "You're a person in this moment, not their teacher. React to what they said, not how they said it." This should remove "¡Muy bien!" and the "service script" feel. Keep it as a description of the situation, not a style rule.

3. **Flag "I'm lost" turns in build-turn-prompt.ts.** When the learner's last message contains something like "no entiendo", "despacito" or "qué?", append a short note to that turn: "They didn't follow. Say it a different way, with one key word or an example, in a shorter reply." This makes the adaptation visible (shorter, reworded, not just simpler) and keeps lost-learner turns near 10 words.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 9 | 8.2 | 9 | 13 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 9 | 8.6 | 7 | 10 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 8 | 8 | 9 | 8.6 | 11 | 13 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 9 | 6 | 9 | 8.8 | 9 | 18 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 9 | 8 | 9 | 9.2 | 15 | 15 |


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

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.6

_Problem: Beto feels a bit generic and scripted, with little local color or personality beyond a stock joke, and he has the learner pay before the ride even starts, which is slightly unnatural._

```
Beto: ¡Buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: Hola, buenas tardes. Sí, yo necesito un taxi por favor.
Beto: ¡Perfecto! Mi taxi está aquí, listo. ¿A dónde vas?
Learner: Yo voy a el Mercado de Artesanías, por favor.
Beto: ¡Buena idea! Está cerca. Sube, amigo, yo conozco el camino.
Learner: Gracias. ¿Cuánto cuesta, por favor?
Beto: Son setenta pesos. ¡Barato para un taxista tan simpático!
Learner: Okay, setenta pesos. Está bien. ¿Puedo pagar con tarjeta?
Beto: Ay, amigo, aquí solo efectivo. Pesos, no tarjeta. ¿Tienes pesos?
Learner: Sí, tengo pesos. Aquí está, setenta pesos.
Beto: ¡Perfecto, gracias! Ahora vamos. Mira, ahí está el Jardín. ¡Bonito, verdad?
Learner: Sí, el Jardín es muy bonito. ¿Es lejos el mercado?
Beto: No, no está lejos. Son cinco minutos. ¡Yo conozco todas las calles!
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.2

_Problem: Don Arturo is pleasant but generic and somewhat flat, offering simple statements about the Zócalo with little distinctive personality, and the closing "¡Muy bien!" slips into teacher-like praise._

```
Don Arturo: ¡Buenas tardes! Qué bonito día en el Zócalo, ¿verdad?
Learner: Ehm... buenas tardes. Sí... es... bonito. Ehm... yo... no hablo mucho español.
Don Arturo: No hay problema. Yo hablo despacio. Me llamo Arturo. ¿Y usted?
Learner: Ehm... me llamo... Sam. Mucho gusto, Arturo.
Don Arturo: Mucho gusto, Sam. Bienvenido a Oaxaca. ¿De dónde es usted?
Learner: Ehm... yo soy de... Estados Unidos. Ehm... ¿y usted... es de Oaxaca?
Don Arturo: Sí, soy de aquí, de Oaxaca. Tengo setenta y tres años. Me gusta sentarme en el Zócalo.
Learner: Ehm... setenta y tres... ¡qué bien! Ehm... el Zócalo es... muy bonito.
Don Arturo: Sí, es muy bonito. Hay árboles y música. Me gusta mirar a la gente aquí.
Learner: Ehm... sí, hay... música. Ehm... ¿usted... viene aquí... todos los días?
Don Arturo: Sí, vengo casi todos los días. Aquí platico con amigos y con visitantes. ¿Y usted, está de vacaciones?
Learner: Ehm... sí, yo estoy... de vacaciones. Ehm... "platico"... ¿qué es? Perdón, no entiendo.
Don Arturo: No se preocupe. Platicar es hablar. Ahora usted y yo platicamos. ¡Muy bien!
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.8

_Problem: Don Arturo stays polite but generic and a bit flat; he gives little vivid local detail and keeps steering the learner away from chatting, so he feels more like a service script than a distinct person._

```
Don Arturo: Buenas tardes. Bienvenido a la terminal. ¿A dónde va?
Learner: Buenas tardes. Quiero ir a Puebla, por favor. Ayer llegué a la ciudad de México y todavía no conozco bien la terminal.
Don Arturo: Bienvenido a México. Puebla está cerca, hay camiones cada rato. ¿Quiere salir hoy?
Learner: Sí, quiero salir hoy, por favor. ¿Usted trabaja aquí todos los días?
Don Arturo: Sí, todos los días, desde hace muchos años. Ya vi de todo aquí. ¿Quiere un boleto para Puebla?
Learner: Sí, un boleto, por favor. ¿Cuánto cuesta y a qué hora sale el próximo camión?
Don Arturo: El boleto cuesta doscientos diez pesos. El próximo camión sale en veinte minutos. Es el andén cuatro.
Learner: Perfecto, gracias. ¿Y el andén cuatro está lejos de aquí? Es que todavía no conozco la terminal.
Don Arturo: No, está cerca. Camine derecho, y el número cuatro está a la izquierda. La terminal es grande, pero no se va a perder.
Learner: Muchas gracias, Don Arturo. ¿Usted vive cerca de la terminal o en otro barrio?
Don Arturo: Vivo lejos, en Iztapalapa. Cada día viajo una hora en metro. Ya soy experto. Buen viaje a Puebla.
Learner: Una hora en metro, ¡qué largo! ¿Y a usted le gusta su barrio en Iztapalapa?
Don Arturo: Sí, me gusta mucho. Es mi barrio, mi familia está ahí. Y la comida es muy rica. Pero ahora, su camión sale pronto.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.2

_Problem: The 'tu cabeza necesita vacaciones / sale barata / está de descanso' joke is repeated three times, and the closing line 'La farmacia no se va' is a slightly odd filler._

```
Daniela: ¡Hola! Bienvenido a la Farmacia San Rafael. Me llamo Daniela. ¿En qué te puedo ayudar?
Learner: Hola Daniela. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro. Tengo paracetamol. Es muy bueno para el dolor de cabeza. ¿Te duele mucho?
Learner: Sí, me duele mucho. Yo tengo el dolor desde ayer.
Daniela: Uy, desde ayer. Qué pena. Aquí está el paracetamol. Tu cabeza necesita vacaciones. ¿Quieres agua también?
Learner: Sí, quiero agua, por favor. ¿Cuánto es la todo?
Daniela: Son sesenta pesos en total. El paracetamol cuesta cuarenta y cinco, y el agua cuesta quince. Tu cabeza sale barata.
Learner: Ok, sesenta pesos. Aquí está el dinero. Gracias, Daniela.
Daniela: Gracias a ti. Toma una pastilla con el agua. Hoy no pienses mucho, tu cabeza está de descanso. Que te mejores.
Learner: Gracias, Daniela. Adiós, y tengo un buen día.
Daniela: Adiós. Que tengas un buen día tú también. Y descansa.
Learner: Gracias. Voy a descansar. Hasta luego.
Daniela: Hasta luego. Aquí estoy si necesitas algo. La farmacia no se va.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.6

_Problem: When the learner said 'no entiendo' about 'después paga', she rephrased only in a slightly simpler form without slowing noticeably or gesturing, and earlier 'Despacito' was followed by a still-quick question; the adaptation is good but modest._

```
Doña Chuy: ¡Buenas tardes, joven! Pásele, pásele. Siéntese, hay mucha comida. ¿Tiene hambre?
Learner: Ehm... buenas tardes. Sí, yo... tengo hambre.
Doña Chuy: ¡Qué bueno! Hoy hay pozole rico. Le sirvo un plato grande. ¿Quiere pozole?
Learner: Ehm... sí, pozole, por favor. ¿Qué es... pozole?
Doña Chuy: ¡Es una sopa, joven! Es caliente, con carne de puerco y maíz. ¡Está muy rica! ¿Le gusta el picante?
Learner: Ehm... ¿picante? Perdón, no entiendo. Más despacio, por favor.
Doña Chuy: ¡Ay, perdón, joven! Despacito. Picante es chile. ¿Quiere chile en el pozole?
Learner: Ehm... chile... sí, un poco, por favor. No mucho.
Doña Chuy: ¡Muy bien! Un poquito de chile, no mucho. Siéntese aquí, joven. Ya le traigo su pozole.
Learner: Ehm... gracias. ¿Cuánto es... el pozole?
Doña Chuy: Setenta pesos, joven. Es un plato grande. ¡Primero coma, después paga!
Learner: Ehm... setenta pesos, okay. Ehm... ¿después... paga? Perdón, no entiendo.
Doña Chuy: Perdón, joven. Primero come su pozole. Después me da los setenta pesos. Sin prisa.
```
