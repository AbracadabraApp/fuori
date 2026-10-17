# Conversation test

2026-10-17 04:21 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.4 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.0 |
| adapts | 7.8 |
| alive | 7.2 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 12 |
| Reply (median words) | 15 |
| Reply (average words) | 14.6 |
| Longest reply (words) | 33 |
| Replies over 30 words | 3% |
| Questions per reply | 0.5 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Stock tics repeat.** Characters lean on one gimmick or phrase: Ramiro's "¡Mi cuchillo no lee tarjetas!", Remedios's "mi vida" in nearly every line, Emiliano re-offering mezcal.
2. **Generic, with no specifics or questions back.** "Hay un lugar bueno cerca de aquí" names nothing, and Ramiro never asks about salsa or meat, so the exchange stays thin.
3. **Weak response when the learner struggles.** Ximena repeated "La hice yo, y me quedó bonita, ¿no?" after a request to slow down and an English plea. Remedios and Cuca also never model the right phrasing after "Puedo yo sentar aquí?"

Lengths look fine: medians run 11 to 17 words and almost nothing is over 30. Ximena's steady 16 to 17 is the only one worth watching, and fixing problem 3 should shorten her.

## Recommendations

1. **Add specifics to the character data, plus one line in the prompt.** Give each character 3 to 4 concrete, nameable things: a real landmark or street, salsas and meats, a price, a personal detail. In character.md add something like: "You know your place well. Name real things, and don't repeat a joke or pet phrase you've already used." This addresses problems 1 and 2 without adding rules about how to talk.

2. **When the learner is lost, answer what they said, in new words.** Add to character.md: "If the learner says they didn't follow, asks for slower, or switches to English, respond to that: shorter, different words, not the same sentence again." If that proves unreliable, have build-turn-prompt.ts detect those cues ("más despacio", "no entiendo", English words) and add a one-line hint to that turn only. This fixes Ximena's case.

3. **Recast naturally, without correcting.** Add one line to character.md: "If the learner says something a little off, answer using the natural phrasing, the way a local would, and keep going." Cuca might say "¿Sentarte aquí? Claro, ahí junto a la ventana." Remedios might say "Una pan, sí, uno de los grandes." The learner hears the right form with no lesson attached.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Ramiro Cervantes (taquero) | Tacos El Pastor de Atascadero, San Miguel de Allende | hesitant | 9 | 9 | 8 | 6 | 7 | 7.8 | 11 | 11 |
| Ximena (alfarera) | Taller de Cerámica Barro Vivo, Guadalajara | hesitant | 9 | 9 | 7 | 7 | 9 | 8.2 | 16 | 17 |
| Emiliano (mezcalero) | Mezcalería Los Amantes, Oaxaca | improving | 10 | 9 | 8 | 7 | 9 | 8.6 | 7 | 16 |
| Doña Remedios (panadera y dueña) | Panadería La Espiga, Puebla | english-beginner | 10 | 9 | 8 | 8 | 9 | 8.8 | 12 | 15 |
| Doña Cuca (cocinera y dueña) | Fonda Doña Cuca, Ciudad de México | english-beginner | 10 | 9 | 8 | 8 | 9 | 8.8 | 13 | 13 |


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

### Ramiro Cervantes, Tacos El Pastor de Atascadero (San Miguel de Allende) · hesitant · 7.8

_Problem: Ramiro leans on the same knife gimmick in nearly every line, which feels scripted rather than like a real taquero, and he never asks about salsa, tortilla or meat type, so the exchange stays thin._

```
Ramiro Cervantes: ¡Hola, bienvenido! Soy Ramiro. Mi cuchillo es muy rápido. ¿Quieres tacos?
Learner: Ehm... hola, Ramiro. Ehm... sí, tacos, por favor.
Ramiro Cervantes: ¡Perfecto! Mira el cuchillo: ¡zas, zas! Ya está la carne. ¿Cuántos tacos quieres?
Learner: Ehm... ¿cuántos? Ehm... tres, por favor.
Ramiro Cervantes: ¡Tres tacos! Buen número. Mira: uno, dos, tres. ¡Zas, zas, zas! Mi cuchillo está feliz.
Learner: Ehm... gracias. Ehm... ¿cuánto es, por favor?
Ramiro Cervantes: Son sesenta pesos. Veinte pesos cada taco. ¡El cuchillo no cobra extra!
Learner: Ehm... sesenta pesos... sí. Ehm... ¿puedo pagar... con tarjeta?
Ramiro Cervantes: Ay, tarjeta no. Solo efectivo. ¡Mi cuchillo no lee tarjetas!
Learner: Ehm... efectivo... ¿Repite, por favor? Más lento.
Ramiro Cervantes: Claro, despacito. Solo... efectivo. Dinero. Sesenta pesos. ¡Y tacos para ti!
Learner: Ehm... ah, dinero. Sí, sí... ehm... aquí, sesenta pesos. Gracias.
Ramiro Cervantes: ¡Perfecto! Gracias a ti. Ahora, tus tacos. ¡Rápido, rápido!
```

### Emiliano, Mezcalería Los Amantes (Oaxaca) · improving · 8.6

_Problem: Emiliano stays generic and repetitive (keeps re-offering mezcal, vague 'un lugar bueno', never names the restaurant or a landmark), so he feels less like a real local mezcalero._

```
Emiliano: ¡Hola! Soy Emiliano. ¿Quieres probar mi mezcal?
Learner: ¡Hola, Emiliano! Sí, quiero probar el mezcal, pero yo soy nuevo aquí en Oaxaca. ¿Tú trabajas aquí todos los días?
Emiliano: ¡Bienvenido a Oaxaca! Sí, trabajo aquí todos los días. Me encanta mi mezcal. ¿Y tú, de dónde eres?
Learner: Soy de Canadá, pero llegué a Oaxaca hace tres semanas. ¿Tú eres de Oaxaca también?
Emiliano: ¡Canadá! Qué bien. Sí, soy de Oaxaca. Este mezcal es de aquí también. ¿Quieres probarlo?
Learner: Sí, por favor, quiero probarlo. ¿Cuál es tu mezcal favorito y cómo se hace?
Emiliano: ¡Muy bien! Mi favorito es el espadín. Es de agave. Toma, un poquito. ¡Despacio, es fuerte!
Learner: Mmm, está muy fuerte pero me gusta. ¿Hay un restaurante bueno cerca de aquí para comer algo?
Emiliano: ¡Jaja, sí, es fuerte, pero rico! Sí, hay restaurantes buenos cerca. Con mezcal, la tlayuda es perfecta. ¿Te gusta el picante?
Learner: Sí, me gusta un poco el picante. ¿Qué es una tlayuda? ¿Dónde puedo comer una buena?
Emiliano: Una tlayuda es una tortilla grande y crujiente. Lleva frijoles, queso y carne. Es como una pizza de Oaxaca, ¡pero mejor! Jaja. Hay un lugar bueno cerca de aquí. Te digo cómo llegar.
Learner: Sí, por favor. Pero más despacio, ¿cómo llego al lugar?
Emiliano: ¡Claro! Despacio, como el mezcal. Primero, sales de aquí y vas a la derecha.
```

### Doña Remedios, Panadería La Espiga (Puebla) · english-beginner · 8.8

_Problem: She never recasts the learner's errors (e.g. 'una pan', 'tú hace') in her own replies, and the 'mi vida' endearment is repeated in almost every line, which flattens her personality a bit._

```
Doña Remedios: ¡Buenos días, mi vida! Pasa, pasa. El pan está calientito. ¿Qué quieres?
Learner: Buenos días, señora. Quiero una pan dulce, por favor.
Doña Remedios: ¡Claro que sí, mi vida! Mira, esta es una concha. Está recién hecha. ¿Te gusta?
Learner: Sí, me gusta mucho. ¿Cuánto cuesta, por favor?
Doña Remedios: Cuesta ocho pesos, mi vida. Y te doy una galletita de regalo, porque eres nuevo.
Learner: Ah, gracias, señora. Aquí está ocho pesos. ¡Tú eres muy amable!
Doña Remedios: De nada, mi vida. Aquí está tu concha y tu galletita. ¡Come, come! Aquí nadie se va con hambre.
Learner: Gracias, señora. La concha es muy rico. ¿Tú eres la dueña?
Doña Remedios: Sí, mi vida, soy la dueña. Es mi panadería. Aquí mando yo, ¡y mi pan está muy rico!
Learner: Ah, qué bien. ¿Tú hace el pan todos los días?
Doña Remedios: Sí, mi vida, todos los días. Me levanto a las cuatro de la mañana y hago el pan.
Learner: ¡Wow! Las cuatro de la mañana es muy temprano! Tú es muy trabajadora.
Doña Remedios: Ay, gracias, mi vida. Sí, es temprano, pero me gusta mi trabajo. ¿Quieres un café?
```

### Doña Cuca, Fonda Doña Cuca (Ciudad de México) · english-beginner · 8.8

_Problem: Her lines are fairly generic and she never recasts the learner's 'Puedo yo sentar aquí?' (e.g., '¿Puedo sentarme aquí?') or shows much personality beyond stock fonda boasting._

```
Doña Cuca: ¡Buenas tardes! Bienvenido a mi fonda. Hoy hay mole y arroz. ¿Tiene hambre?
Learner: Sí, tengo hambre. Yo quiero el mole, por favor.
Doña Cuca: ¡Buena elección! Siéntese aquí, por favor. Mi mole es el mejor del Centro.
Learner: Gracias. ¿Cuánto cuesta el mole?
Doña Cuca: Son ochenta pesos. ¡Es barato para tanto sabor!
Learner: Ochenta pesos, está bien. ¿Y tiene agua, por favor?
Doña Cuca: Sí, claro. Tengo agua natural y agua de jamaica. ¿Cuál quiere?
Learner: Agua de jamaica, por favor. ¿Es dulce?
Doña Cuca: Sí, es dulce, pero no mucho. ¡Está muy fresca y la hago yo!
Learner: Perfecto, gracias. ¿El mole es picante?
Doña Cuca: Un poquito, nada más. Mi mole es sabroso, no es fuego. Siéntese, ya le traigo todo.
Learner: Gracias, señora. ¿Puedo yo sentar aquí?
Doña Cuca: Sí, ahí mismo, junto a la ventana. Es buena mesa.
```

### Ximena, Taller de Cerámica Barro Vivo (Guadalajara) · hesitant · 8.2

_Problem: When the learner asked for slower speech, Ximena just repeated the same question with a mild gesture instead of really simplifying, and she ignored the learner's English-assisted plea about 'tazas' with only a gesture and a slightly complex follow-up ('La hice yo, y me quedó bonita')._

```
Ximena: ¡Hola! Bienvenido a mi taller. Yo soy Ximena. Hago vasijas de barro aquí. ¿Cómo te llamas?
Learner: Ehm... hola. Yo... me llamo Daniel.
Ximena: ¡Mucho gusto, Daniel! Mira, tengo barro en las manos. ¡Siempre! ¿Te gusta?
Learner: Ehm... sí. Me gusta... ehm... mucho gusto.
Ximena: ¡Qué bien, Daniel! A mí me encanta el barro. Es mi vida. ¿Quieres tocar?
Learner: Ehm... ¿tocar? Perdón, no entiendo. ¿Más despacio, por favor?
Ximena: ¡Claro, Daniel! Mira, tocar es así. El barro está suave y frío. ¡Es muy bonito! ¿Quieres tocar?
Learner: Ehm... sí. Sí, quiero... ehm... tocar. Gracias.
Ximena: ¡Muy bien! Toma, toca aquí. Está frío, ¿verdad? Es barro de Tlaquepaque. ¡Mi barro es el mejor!
Learner: Ehm... sí, está frío. ¿Es... ehm... Tlaque... qué?
Ximena: ¡Sí, Tlaquepaque! Es un nombre largo, ja, ja. Aquí está mi taller. Aquí hago tazas y platos.
Learner: Ehm... ¿tazas? Sorry, ¿qué es "tazas"?
Ximena: ¡Mira, esta es una taza! Es para el café. La hice yo, y me quedó bonita, ¿no?
```
