# Conversation test

2026-10-17 21:42 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, sometimes ask" · learner taps reply buttons (replies 2026-10-17) · 5 conversations · 6 learner turns each

## Grade: 8.4 / 10

| Criterion | Average |
|---|---|
| language | 9.8 |
| understands | 9.0 |
| adapts | 7.6 |
| alive | 7.0 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 12 |
| Reply (median words) | 18 |
| Reply (average words) | 17.5 |
| Longest reply (words) | 24 |
| Replies over 30 words | 0% |
| Questions per reply | 0.9 |
| Replies asking 2+ questions | 9% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
1. **Replies run long for spoken turns.** Medians of 15-20 words (versus about 10) stack several sentences and often a question. "Mira, ahí hay una banca con flores amarillas. ¿Quieres sentarte?" and "Espérese tantito y sople un poquito. Mientras, tome su agua. ¿Le traigo una cuchara más grande?" both leave the learner little room to answer.
2. **Characters feel like generic service scripts.** They have no stake of their own, so they fall back on simple preference questions or stock lines. "Buen viaje a Puebla, y coma un mole poblano por mí" is pleasant but could come from any ticket seller. Beto never pitches a ride.
3. **Repeated bits and thin local flavor.** Don Arturo keeps returning to "hoy o mañana" after the learner has already explained, and he uses few Oaxacan expressions.

## Recommendations
1. **Add one sentence on turn size to `character.md`.** For example: "Answer the way a person does in a passing moment: one short thought, and ask at most one thing." This is about turn-taking, not simplifying. Vocabulary and speed stay native, and the learner gets room to respond. It should also cut the stacked questions.
2. **Give each character a small want and a personal detail in the character data.** Examples: Beto needs a fare and knows a good route or a tour to pitch; the taquillero has a line behind the learner and a clock; Don Arturo has a Oaxacan habit or opinion about food. This gives them something to bring up instead of defaulting to yes/no preference questions, and it describes the situation rather than dictating speech.
3. **Add a short reminder in `build-turn-prompt.ts`.** For example: "React to what the learner actually just said. Don't return to a joke or line you already used." This addresses the repeated "hoy o mañana" and "go to gate four" and makes odd answers (like the Madrid one) get a real reaction. Skip any regional-vocabulary push for now. Doña Chuy scored 10 there, so a data detail like item 2 may be enough for Don Arturo.

Daniela and Doña Chuy look fine. Their problems are minor, so I wouldn't change anything specifically for them.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 8 | 7 | 6 | 8 | 7.8 | 10 | 18 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 5 | 8 | 8.2 | 10 | 18 |
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 10 | 9 | 8 | 8 | 8 | 8.6 | 16 | 20 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 9 | 8 | 8 | 8 | 8.6 | 24 | 15 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 7 | 8 | 10 | 8.6 | 12 | 15 |


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

_Problem: Beto sounds like a generic language-lesson script rather than a taxi driver: he keeps asking simple yes/no preference questions and never pitches rides, mentions taxi life, or shows his own personality._

```
Beto: ¡Hola! Soy Beto. Este es mi taxi. ¿Necesitas un taxi?
Learner: No, no necesito un taxi, gracias.
Beto: ¡Está bien, no hay problema! Hoy hace mucho sol en el Jardín. ¿Te gusta el Jardín?
Learner: Sí, me gusta el sol del Jardín.
Beto: ¡Qué bueno! A mí también me gusta. Aquí todo es bonito. ¿Es tu primera vez en San Miguel?
Learner: Sí, es mi primera vez en San Miguel.
Beto: ¡Bienvenido a San Miguel! Yo conozco todas las calles. Aquí está la iglesia, la Parroquia. Es muy bonita. ¿Quieres ver la iglesia?
Learner: No, quiero ver el Jardín.
Beto: ¡Perfecto! El Jardín es el corazón de San Miguel. Hay árboles, bancas y mucha gente. ¿Te gustan los árboles?
Learner: No, me gustan las flores.
Beto: ¡Qué bonito! Aquí hay flores en el Jardín. Hay flores rojas y flores amarillas. ¿Te gustan más las rojas o las amarillas?
Learner: Me gustan más las amarillas.
Beto: ¡Las amarillas! Yo también. Son como el sol. Mira, ahí hay una banca con flores amarillas. ¿Quieres sentarte?
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 7.8

_Problem: The character is a generic, scripted ticket seller who repeats 'go to gate four' and never reacts to the odd Madrid answer or engages the learner as a person, so it feels like a flat service script._

```
Don Arturo: ¡Buenas tardes! Bienvenido a la taquilla. ¿Va a viajar hoy?
Learner: Sí, voy a viajar hoy a Madrid.
Don Arturo: ¡Ah, Madrid! Qué bonito. Pero aquí solo vendo boletos de autobús, y no hay autobús a España. ¿Quiere ir a Puebla o a Veracruz?
Learner: Quiero ir a Puebla, por favor.
Don Arturo: ¡Muy bien! Puebla es bonita y tiene muy buena comida. Hay un autobús en una hora. ¿Un boleto?
Learner: Sí, quiero un boleto, por favor.
Don Arturo: Perfecto. Son doscientos pesos. Aquí tiene su boleto. El autobús sale en la puerta cuatro. ¿Va a pagar con efectivo?
Learner: Voy a pagar con efectivo.
Don Arturo: Muy bien, gracias. Aquí está su cambio. Buen viaje a Puebla, y coma un mole poblano por mí.
Learner: Voy a comer un mole poblano, gracias.
Don Arturo: ¡Qué bien! El mole es muy rico. Ahora vaya a la puerta cuatro. ¿Le gusta el picante?
Learner: Sí, me gusta el picante.
Don Arturo: ¡Ajá, entonces va a estar feliz en Puebla! Allá todo lleva chile. Ya casi sale su autobús, mejor vaya a la puerta cuatro.
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.6

_Problem: Don Arturo keeps teasing the learner about 'hoy o mañana' after they clearly explained themselves, which is a bit repetitive, and he uses few distinctly Mexican or Oaxacan expressions._

```
Don Arturo: ¡Buenas tardes! Hace buen sol hoy en el Zócalo. ¿Usted es de aquí, o es turista?
Learner: Yo soy de aquí, de la Ciudad de México.
Don Arturo: ¡Ah, de la capital! Bienvenido a Oaxaca. Aquí hay más calma, y mejor mole, ¡es mi opinión! ¿Le gusta el mole?
Learner: No, no me gusta el mole.
Don Arturo: ¡Ay, qué pena! Bueno, no pasa nada. Aquí hay otras cosas ricas. ¿Prefiere una tlayuda o un tamal?
Learner: Prefiero un tamal, por favor.
Don Arturo: ¡Muy buena elección! Los tamales de Oaxaca van en hoja de plátano, no en hoja de maíz. ¿Tiene hambre ahora?
Learner: Sí, tengo mucha hambre ahora.
Don Arturo: ¡Entonces es hora de comer! Aquí en el Zócalo hay señoras que venden tamales calientitos. Yo siempre compro uno por la mañana.
Learner: Voy a comprar un tamal mañana.
Don Arturo: ¡Ja, ja! ¿Mañana? Pero usted tiene mucha hambre ahora, ¿verdad?
Learner: Sí, tengo hambre, pero voy a comprar un tamal mañana.
Don Arturo: ¡Ja, ja! Hoy tiene hambre, y el tamal es para mañana. Yo prefiero comer hoy. ¿Y usted, hoy o mañana?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.6

_Problem: Minor: a pharmacist handing over a pill without asking about allergies or medication, and the quirky jokes feel slightly staged, though nothing is unnatural enough to hurt the exchange._

```
Daniela: ¡Hola, buenas tardes! Bienvenido a la Farmacia San Rafael. Yo soy Daniela. Hoy no hay mucha gente, solo tú y las pastillas. ¿Necesitas algo?
Learner: Necesito algo para el dolor de cabeza.
Daniela: Ay, lo siento. Tengo pastillas para eso. Son pequeñas, pero muy valientes. ¿Te duele mucho?
Learner: Me duele un poco la cabeza.
Daniela: Ah, solo un poco. Entonces una pastilla suave es suficiente. Aquí tienes. ¿Quieres agua también?
Learner: Sí, quiero agua, por favor.
Daniela: Claro. Aquí tienes el agua. Tómate la pastilla con calma, no tienes prisa. Yo no me voy.
Learner: Gracias, Daniela, eres muy amable.
Daniela: De nada. Ayudar es mi trabajo, y también mi pasatiempo. ¿Ya te sientes mejor?
Learner: Me siento mejor, gracias.
Daniela: Qué bueno. La pastilla trabaja rápido hoy, más rápido que yo. ¿Quieres sentarte un momento?
Learner: Sí, quiero sentarme un momento.
Daniela: Perfecto. Hay una silla junto a la ventana. Es la mejor silla de la farmacia.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.6

_Problem: The learner never signals confusion, so adaptation isn't really tested, though Doña Chuy keeps her sentences short and simple; she also asks stacked questions in some turns._

```
Doña Chuy: ¡Buenas tardes, joven! Pásele, pásele. Hoy hay sopa y pollo. ¿Tiene hambre?
Learner: Sí, tengo un poco de hambre.
Doña Chuy: ¿Un poquito? ¡Aquí nadie come poquito! Siéntese, le doy un plato grande. ¿Sopa o pollo?
Learner: Quiero la sopa, por favor.
Doña Chuy: ¡Muy bien! Ahorita le traigo su sopa. Está calientita y huele rico. ¿Quiere tortillas?
Learner: No, no quiero tortillas, gracias.
Doña Chuy: ¿Sin tortillas? Ay, bueno, usted manda. Aquí está su sopa. ¡Cuidado, está muy caliente! ¿Agua de jamaica o de limón?
Learner: Quiero agua de jamaica, por favor.
Doña Chuy: ¡Perfecto! Aquí tiene su agua de jamaica, bien fría. Ándele, coma su sopa. ¿Está rica?
Learner: La sopa está muy caliente todavía.
Doña Chuy: Ay, sí, ¡está recién hecha! Espérese tantito y sople un poquito. Mientras, tome su agua. ¿Le traigo una cuchara más grande?
Learner: No, gracias, esta cuchara está bien.
Doña Chuy: Muy bien, como usted diga. Coma despacito, no hay prisa aquí. Yo le doy más sopa si quiere, ¿eh?
```
