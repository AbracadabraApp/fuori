# Conversation test

2026-10-17 04:21 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.6 / 10

| Criterion | Average |
|---|---|
| language | 9.4 |
| understands | 9.4 |
| adapts | 8.2 |
| alive | 7.4 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 14 |
| Reply (average words) | 16.5 |
| Longest reply (words) | 30 |
| Replies over 30 words | 0% |
| Questions per reply | 0.6 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run longer than a real turn (~10 words).** Emiliano's median is 25 and Doña Cuca's is 19, and Remedios (14) and Ximena (13) are also over. Doña Cuca: "Sí, es una flor, y es muy rica. Ahora se la traigo bien fría. Con el mole, va a ver."
2. **Characters are generic and passive.** They narrate or repeat stock phrases instead of bringing in specific local detail or a natural next move. Ramiro: "¡Listo! Tres tacos con piña, cebolla y cilantro. ¡Para un campeón! Aquí tienes." He never asks "¿para llevar o para comer aquí?" or offers salsa. Remedios's "mi vida" and Cuca's "muy rica" are the same problem: tics with nothing new added.
3. **A lost learner gets more Spanish only.** Ximena answered "Sorry, what?" with a longer Spanish explanation: "Aprieta es así, mira: cierro la mano y hago fuerza."

## Recommendations

1. **Add a short length nudge in `build-turn-prompt.ts`, not in the character prompt.** Something like: "Réplica de conversación real: una o dos frases cortas, alrededor de 10 palabras. Deja espacio para que responda." This keeps `character.md` minimal and attacks the most common problem. The "0% over 30" result hides that most turns are still too long.

2. **Add 3–4 concrete specifics per character to the character data.** Examples: Emiliano gets the agave variety, sal de gusano with orange, and his fonda's name. Ramiro gets his salsas, prices, and "¿para llevar?". Cuca gets her daily specials. Present them as things in the character's world, not rules, so one surfaces per turn and gives the learner something to react to. This also fixes the repeated "mi vida" and "muy rica" lines.

3. **Handle clear signs of being lost in the turn prompt.** When the learner replies in English or says they don't understand, add a line like: "Si no entendió, di la palabra clave en inglés en una sola palabra y sigue en español, corto." Ximena's reply would become "Aprieta... squeeze. Así, mira." The Remedios subjunctive slip ("te gusta") is a one-off, so don't add rules for it.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Ximena (alfarera) | Taller de Cerámica Barro Vivo, Guadalajara | hesitant | 8 | 9 | 7 | 7 | 8 | 7.8 | 13 | 13 |
| Ramiro Cervantes (taquero) | Tacos El Pastor de Atascadero, San Miguel de Allende | hesitant | 9 | 9 | 8 | 7 | 8 | 8.2 | 10 | 11 |
| Doña Remedios (panadera y dueña) | Panadería La Espiga, Puebla | english-beginner | 10 | 9 | 8 | 8 | 9 | 8.8 | 8 | 14 |
| Emiliano (mezcalero) | Mezcalería Los Amantes, Oaxaca | improving | 10 | 10 | 9 | 7 | 8 | 8.8 | 11 | 25 |
| Doña Cuca (cocinera y dueña) | Fonda Doña Cuca, Ciudad de México | english-beginner | 10 | 10 | 9 | 8 | 10 | 9.4 | 14 | 19 |


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

### Doña Remedios, Panadería La Espiga (Puebla) · english-beginner · 8.8

_Problem: Minor: she uses "Me da gusto que te gusta" (indicative instead of subjunctive "te guste"), and the persona feels slightly repetitive with "mi vida" in nearly every line._

```
Doña Remedios: ¡Buenos días, mi vida! Pásale, pásale. ¿Qué quieres?
Learner: Buenos días. Quiero un pan, por favor... uh, ¿cuánto cuesta la concha?
Doña Remedios: La concha cuesta doce pesos, mi vida. Está calientita. ¿Cuál quieres, rosa o amarilla?
Learner: Rosa, por favor. Uh, ¿y cuánto cuesta el café?
Doña Remedios: El café cuesta quince pesos, mi vida. ¿Lo quieres con leche?
Learner: Sí, con leche, por favor. Uh, ¿cuánto es todo?
Doña Remedios: Son veintisiete pesos, mi vida. Doce más quince. Y te regalo una galletita, porque sí.
Learner: Gracias, usted es muy amable. Uh, aquí está treinta pesos.
Doña Remedios: Gracias a ti, mi vida. Aquí tienes tres pesos de cambio y tu galletita. Siéntate, que el café está calientito.
Learner: Gracias. Uh, ¿puedo sentar aquí?
Doña Remedios: Sí, mi vida, siéntate ahí. Es una mesa buena, con sol.
Learner: Gracias. Uh, la galletita es muy bonita. ¿Cómo se llama usted?
Doña Remedios: Me llamo Remedios, pero todos me dicen Doña Remedios. Me da gusto que te gusta la galletita. ¿Y tú, cómo te llamas?
```

### Ramiro Cervantes, Tacos El Pastor de Atascadero (San Miguel de Allende) · hesitant · 8.2

_Problem: Ramiro's personality is fairly generic and a bit repetitive (narrating actions, 'por favor' flow), and he never offers salsa, price, or a natural follow-up like 'para llevar o para comer aquí'._

```
Ramiro Cervantes: ¡Buenas noches, amigo! Bienvenido a los tacos. ¿Qué te preparo?
Learner: Ehm... hola. Yo... ehm... quiero... tacos, por favor.
Ramiro Cervantes: ¡Claro que sí! Tacos al pastor, los mejores de la calle. Mi cuchillo es rápido. ¿Cuántos quieres?
Learner: Ehm... ¿cuántos? Ehm... tres, por favor.
Ramiro Cervantes: ¡Tres tacos! Perfecto. Mira, corto la carne: ¡zas, zas! ¿Con piña?
Learner: Ehm... sí. Con piña, por favor.
Ramiro Cervantes: ¡Muy bien! La piña va encima, ¡así! Ya casi están tus tres tacos. ¿Con cebolla y cilantro?
Learner: Ehm... ¿cebolla? Ehm... perdón, no entiendo. ¿Más despacio, por favor?
Ramiro Cervantes: ¡Claro, sin problema! Despacio. Mira, esta es la cebolla. ¿Quieres cebolla?
Learner: Ehm... sí, cebolla. Sí, por favor.
Ramiro Cervantes: ¡Perfecto! Cebolla, ¡lista! Y esto verde es el cilantro. ¿Quieres cilantro?
Learner: Ehm... sí. Cilantro, sí, por favor.
Ramiro Cervantes: ¡Listo! Tres tacos con piña, cebolla y cilantro. ¡Para un campeón! Aquí tienes.
```

### Emiliano, Mezcalería Los Amantes (Oaxaca) · improving · 8.8

_Problem: Emiliano is friendly but generic for a mezcalero in Oaxaca, with little sensory or local detail such as the agave variety, orange slices with sal de gusano, or the name of his fonda._

```
Emiliano: ¡Hola, bienvenido! Soy Emiliano. Aquí hacemos mezcal. ¿Quieres probar un poco?
Learner: ¡Hola, Emiliano! Sí, quiero probar, porque ayer yo caminé por el centro y vi muchas mezcalerías. ¿Tú haces el mezcal aquí?
Emiliano: ¡Sí! Yo hago el mezcal con mi familia, en un pueblo cerca. Aquí lo servimos. Toma, este es mi favorito.
Learner: Gracias, Emiliano. Mmm, es muy fuerte, pero me gusta. ¿Tu familia hace el mezcal todos los días?
Emiliano: ¡Jaja, sí, es fuerte! Así es el buen mezcal. No lo hacemos todos los días. Es mucho trabajo, y es lento. Pero vale la pena.
Learner: Entiendo, es mucho trabajo. ¿Cuánto tiempo toma para hacer una botella de mezcal?
Emiliano: ¡Mucho tiempo! El agave crece ocho años o más. Después lo cocinamos, lo fermentamos y lo destilamos. Cada botella tiene muchos años de trabajo.
Learner: Ocho años, ¡qué mucho! Yo no sabía eso. ¿Y qué significa "destilamos"?
Emiliano: Destilar es calentar el líquido. Sale vapor, y el vapor se vuelve líquido otra vez. Ese líquido es el mezcal. Es como magia, pero con fuego.
Learner: Ah, entiendo, es como magia con fuego. ¿Y tú trabajas en el pueblo también, o solamente aquí en la mezcalería?
Emiliano: Trabajo en los dos lugares. Algunos días estoy en el pueblo, con los agaves y el horno. Otros días estoy aquí, con la gente. ¿Y tú, qué haces en Oaxaca?
Learner: Estoy aquí para aprender español, y llevo unas semanas en Oaxaca. Me gusta mucho la comida, ayer comí tlayudas. ¿Tú tienes un restaurante favorito en el barrio?
Emiliano: ¡Tlayudas, qué bueno! Sí, tengo una fonda pequeña cerca de aquí. Ahí hacen un mole muy rico. Tlayuda y mezcal son una buena pareja. ¿Te gustó la tlayuda?
```

### Ximena, Taller de Cerámica Barro Vivo (Guadalajara) · hesitant · 7.8

_Problem: When the learner said 'Sorry, what?' in English, Ximena didn't give a quick English gloss of 'aprieta' (squeeze) and only explained in Spanish with a gesture, which may not help a lost A1 learner._

```
Ximena: ¡Hola! Bienvenido a mi taller. Soy Ximena. Hago cerámica aquí. ¿Cómo te llamas?
Learner: Ehm... hola. Yo... me llamo David.
Ximena: ¡Mucho gusto, David! Mira, hago una olla de barro. ¿Te gusta?
Learner: Ehm... sí. Me gusta... es muy bonita.
Ximena: ¡Gracias, David! La hago con mis manos. ¿Quieres tocar el barro?
Learner: Ehm... ¿tocar? Ehm... sí, por favor. ¿Es... difícil?
Ximena: No, no es difícil. Ven, siéntate aquí. El barro está húmedo y fresco. ¿Listo?
Learner: Ehm... "húmedo"... ¿qué es "húmedo"? Perdón, más lento, por favor.
Ximena: No hay problema, David. Húmedo es un poco mojado. Toca el barro, despacio.
Learner: Ehm... ah, mojado. Sí, okay... ¿así?
Ximena: ¡Sí, así, muy bien! Tienes manos de alfarero. Ahora aprieta un poco el barro.
Learner: Ehm... "aprieta"... ¿qué es "aprieta"? Sorry, what?
Ximena: Aprieta es así, mira: cierro la mano y hago fuerza. Hazlo tú, poquito a poco.
```

### Doña Cuca, Fonda Doña Cuca (Ciudad de México) · english-beginner · 9.4

_Problem: The character is warm but fairly generic; she never recasts the learner's 'el tacos' or reacts with much personality beyond stock fonda phrases, and her last lines repeat 'muy rica' without adding anything new._

```
Doña Cuca: ¡Buenas tardes, pase, pase! Bienvenido a mi fonda. Yo soy Doña Cuca. ¿Tiene hambre?
Learner: Hola, buenas tardes. Sí, yo tengo hambre. ¿Tú tienes... um, menú?
Doña Cuca: ¡Claro que sí! Hoy hay mole, sopa y tacos. Todo está muy rico. ¿Qué quiere?
Learner: Um, yo quiero... el tacos, por favor. ¿Qué es mole?
Doña Cuca: ¡Muy bien, los tacos! El mole es una salsa de chile y chocolate. Lo sirvo con pollo. ¡Es mi orgullo! ¿Quiere probar un poquito?
Learner: Sí, yo quiero probar... el mole, por favor. ¡Chocolate y chile, interesante!
Doña Cuca: ¡Ándele, siéntese aquí! Ahora le traigo un poquito de mole y sus tacos. Es raro, pero está buenísimo.
Learner: Gracias, Doña Cuca. ¿Usted tiene agua, por favor?
Doña Cuca: ¡Sí, cómo no! Tengo agua natural y agua de jamaica. Con el mole, la jamaica está mejor. ¿Cuál quiere?
Learner: Um, ¿qué es jamaica? Yo no entiendo.
Doña Cuca: La jamaica es una flor roja. Con la flor hago un agua dulce y fría. Es muy rica con el mole. ¿Quiere probar?
Learner: Sí, yo quiero la jamaica, por favor. ¿Es una flor? Interesante.
Doña Cuca: Sí, es una flor, y es muy rica. Ahora se la traigo bien fría. Con el mole, va a ver.
```
