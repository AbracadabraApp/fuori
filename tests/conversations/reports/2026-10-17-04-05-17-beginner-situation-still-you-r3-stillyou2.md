# Conversation test

2026-10-17 04:05 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.7 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.4 |
| adapts | 8.2 |
| alive | 7.4 |
| regional | 8.8 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 15 |
| Reply (average words) | 15.8 |
| Longest reply (words) | 27 |
| Replies over 30 words | 0% |
| Questions per reply | 0.4 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Characters don't track or build on the conversation.** Beto says "¡Suba, por favor!" after the learner is already in the taxi, and Don Arturo says he comes every day twice. "Qué bien" is all Beto does with Texas. This is why "alive" is the lowest score (6-7).
2. **Repair misses when the learner is lost.** Daniela defines "curar" with "es hacer que estés sano," which is too abstract for an A1 learner. Doña Chuy answers a repeat request with new content: "Mire, aquí están las tortillas. ¡Calientitas!"
3. **Turns are one-way and a bit long, so the learner has little to grab.** Don Arturo (CDMX) runs a median of 24 words, makes statements only, and asks nothing back: "Buen viaje." Don Arturo (Oaxaca) runs about 19 words and stays generic.

## Recommendations

1. **Give each turn a short "already said / already happened" note in `build-turn-prompt.ts`.** Include the character's last two or three lines and the current state (for example, "learner is already in the taxi"). Add one line: "Don't repeat what you've said or done; react to something specific the learner just said." This directly targets the repeated "Suba" and the repeated "todos los días."

2. **Add a short repair rule to `character.md`.** Something like: "If the learner asks you to repeat, say the same thing again, slower or shorter, with no new information. If they ask what a word means, show it with something in the scene or a quick example, not a definition." This doesn't simplify the character's normal speech. It only changes what happens when the learner signals they're lost, and it fixes both the Daniela and Chuy cases.

3. **Add one or two specific details per character in the character data, plus a habit of handing the turn back.** For example, Beto has driven other Texans and has an opinion about San Miguel, and Arturo (Oaxaca) has a particular bench and a story about the plaza. The CDMX taquillero is curious about his customer. Add "say one thing, then give the learner room, often with a short question." The detail cures the generic feel, and the shorter turns (aiming near 10-12 words) leave space to answer.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 9 | 8 | 6 | 8 | 8.2 | 10 | 10 |
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 9 | 7 | 8 | 8.4 | 16 | 19 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 7 | 8 | 9 | 8.8 | 15 | 15 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 8 | 8 | 10 | 8.8 | 11 | 12 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 9 | 8 | 9 | 9.2 | 9 | 24 |


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

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.2

_Problem: Beto repeats 'Suba, por favor' after the learner already got in, ignoring the conversation's progress, and his lines feel like scripted taxi patter rather than a real driver reacting to the learner (e.g. nothing about Texas beyond 'Qué bien')._

```
Beto: ¡Hola! Soy Beto. Este es mi taxi. ¿Necesitas un taxi?
Learner: Hola Beto. Sí, yo necesito un taxi para el Mercado de Artesanías, por favor.
Beto: ¡Claro que sí! Conozco todas las calles. Sube, por favor.
Learner: Gracias. ¿Cuánto cuesta el taxi?
Beto: Son setenta pesos. Es barato y es rápido. ¡Vamos!
Learner: Okay, setenta pesos. Está bien, gracias. ¿Es lejos el mercado?
Beto: No, no es lejos. Son diez minutos, más o menos. ¡Conmigo es más rápido!
Learner: Ah, diez minutos. Muy bien. ¿Usted es de San Miguel?
Beto: ¡Sí, soy de San Miguel! Aquí vivo y aquí trabajo. ¿Y usted, de dónde es?
Learner: Yo soy de Estados Unidos. Soy de Texas.
Beto: ¡Texas! Qué bien. Mi taxi es pequeño, pero hay espacio. ¡Suba, por favor!
Learner: Okay, gracias. Yo... subo ahora.
Beto: ¡Perfecto! Yo abro la puerta. Ya vamos al mercado.
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.4

_Problem: Don Arturo is warm and patient but a bit generic, and he repeats himself (said he comes every day, then again) without adding much local Oaxacan color or a personal story._

```
Don Arturo: ¡Buenas tardes! Siéntese, por favor. Hace buen sol hoy en el Zócalo. ¿Es usted nuevo aquí?
Learner: Ehm... buenas tardes. Sí, yo... ehm... nuevo. Soy de Estados Unidos.
Don Arturo: ¡Qué bueno! Bienvenido a Oaxaca. Yo me llamo Arturo. Vengo aquí todos los días. ¿Y usted, cómo se llama?
Learner: Ehm... me llamo... David. Mucho gusto, Don Arturo.
Don Arturo: Mucho gusto, David. Usted habla muy bien. Mire, el Zócalo es bonito, ¿verdad?
Learner: Sí, ehm... es muy bonito. Gracias, pero yo hablo... poco español.
Don Arturo: No hay problema, David. Poco a poco. Yo hablo despacio, porque ya soy viejo y tengo tiempo. Mire los árboles grandes. ¿Los ve?
Learner: Ehm... sí, veo los árboles. Son... ehm... muy grandes.
Don Arturo: Sí, son muy grandes. Son laureles, y tienen muchos años, como yo. Dan buena sombra. ¿Le gustan?
Learner: Ehm... sí, me gustan. Ehm... ¿qué es "sombra"?
Don Arturo: Sombra es el lugar donde no hay sol. Aquí hay sol. Allá, debajo del árbol, hay sombra. Es mi lugar favorito, David.
Learner: Ehm... ah, sombra, ok. ¿Usted... ehm... viene aquí todos los días?
Don Arturo: Sí, David, vengo casi todos los días. Me siento en la sombra y miro a la gente. Es muy tranquilo.
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 9.2

_Problem: Replies are a bit brief and service-like, and he doesn't ask the chatty learner anything back, so the personality stays fairly thin._

```
Don Arturo: Buenas tardes. Bienvenido a la terminal. ¿A dónde va?
Learner: Buenas tardes. Quiero ir a Puebla, por favor. Ayer visité el Zócalo y hoy quiero conocer otra ciudad.
Don Arturo: Puebla, muy bien. Es una ciudad bonita. Salen autobuses cada rato. ¿Para hoy?
Learner: Sí, para hoy, por favor. ¿Cuánto cuesta el boleto y cuánto tiempo dura el viaje?
Don Arturo: El boleto cuesta unos doscientos veinte pesos. El viaje dura dos horas, más o menos. ¿Le doy un boleto?
Learner: Sí, un boleto, por favor. ¿Usted es de la Ciudad de México? ¿Le gusta trabajar en la terminal?
Don Arturo: Sí, soy de aquí, de la ciudad. Me gusta mi trabajo, pero hay mucha gente y mucho ruido. Aquí tiene su boleto. Son doscientos veinte pesos.
Learner: Aquí tiene, gracias. ¿Usted vive cerca de la terminal? ¿Qué lugares me recomienda en Puebla?
Don Arturo: Gracias a usted. Vivo cerca, en metro son veinte minutos. En Puebla, vaya al centro. Hay una catedral bonita y mucho mole. Buen viaje.
Learner: Gracias, Don Arturo. ¿El mole poblano es muy picante? Yo no como mucho picante.
Don Arturo: No, el mole no es muy picante. Es un poco dulce, tiene chocolate. Pero cuidado con la salsa, ¡esa sí pica! Pida también un agua.
Learner: Ah, qué bueno, gracias. ¿Y usted come mole a menudo? ¿Cuál es su comida favorita de la Ciudad de México?
Don Arturo: Como mole a veces, en las fiestas. Mi comida favorita son los tacos de canasta. Son baratos y muy ricos. Y no pican mucho, ¡como usted quiere!
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.8

_Problem: When the learner asked about "curan", Daniela explained it with a subjunctive definition ("hacer que estés sano") that is hard for an A1 learner, instead of using simpler words or a gesture or example._

```
Daniela: ¡Buenas tardes! Bienvenido a la Farmacia San Rafael. Yo soy Daniela. ¿En qué te ayudo?
Learner: Buenas tardes. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro. Tengo pastillas para el dolor de cabeza. Aquí están. ¿Te duele mucho?
Learner: Sí, me duele mucho. Y también yo tengo un poco de fiebre.
Daniela: Ay, lo siento mucho. Tengo paracetamol. Es bueno para el dolor y para la fiebre. Dos problemas, una pastilla. ¿Quieres una caja?
Learner: Sí, quiero una caja, por favor. ¿Cuánto cuesta?
Daniela: Son cuarenta y cinco pesos. Es barato para dos problemas. Aquí está la caja. Y descansa mucho hoy, por favor.
Learner: Gracias. Aquí está cincuenta pesos.
Daniela: Gracias. Aquí tienes cinco pesos de cambio. No curan la fiebre, pero son tuyos.
Learner: Gracias. Perdón, no entiendo "curan". ¿Repite, por favor?
Daniela: Claro. "Curar" es hacer que estés sano. La pastilla ayuda. Las monedas no, solo son monedas.
Learner: Ah, ja ja, entiendo. Muchas gracias, adiós.
Daniela: Adiós. Que te mejores pronto. Y toma agua.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.8

_Problem: When asked to repeat "tortillas y... qué?", she repeats but adds extra content instead of just slowing down, and her "careful" gloss is a bare translation with no further help._

```
Doña Chuy: ¡Hola, bienvenido! Pase, pase. Siéntese aquí, hay sopa caliente. ¿Tiene hambre?
Learner: Ehm... hola. Sí, ehm... yo tengo hambre... gracias.
Doña Chuy: ¡Muy bien! Siéntese aquí. Yo le doy un plato grande. ¿Quiere sopa?
Learner: Ehm... sí, sopa, por favor. ¿Qué... qué es la sopa?
Doña Chuy: Es sopa de pollo con fideos. Está caliente y muy rica. ¡Y le doy un plato grande!
Learner: Ehm... pollo, sí, okay. Sí, sopa de pollo, por favor... ¿cuánto... cuánto es?
Doña Chuy: Son sesenta pesos. Incluye tortillas y agua. ¡Ahora siéntese y coma!
Learner: Ehm... sesenta pesos, okay. Perdón, ¿repite por favor? ¿Tortillas y... qué?
Doña Chuy: Tortillas y agua. Mire, aquí están las tortillas. ¡Calientitas! El agua es para beber.
Learner: Ah, okay... tortillas y agua. Gracias, ehm... muy amable.
Doña Chuy: De nada, mijo. Aquí todos comen bien. Ahorita le traigo la sopa. ¡Con cuidado, está muy caliente!
Learner: Ehm... sí, gracias. Sorry, ¿"con cuidado" es... what?
Doña Chuy: "Con cuidado" es "careful". La sopa está muy caliente. ¡Despacito, mijo!
```
