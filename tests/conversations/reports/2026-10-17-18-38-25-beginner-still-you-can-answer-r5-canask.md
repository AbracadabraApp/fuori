# Conversation test

2026-10-17 18:38 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, can answer" · 5 conversations · 6 learner turns each

## Grade: 8.2 / 10

| Criterion | Average |
|---|---|
| language | 8.8 |
| understands | 9.2 |
| adapts | 8.2 |
| alive | 6.4 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 16 |
| Reply (average words) | 15.2 |
| Longest reply (words) | 33 |
| Replies over 30 words | 3% |
| Questions per reply | 0.8 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Characters feel generic and don't pick up on the learner.** Beto gives stock lines and never recasts "yo me gusta" ("¡Sí, es muy bonito! Mira, allí está la Parroquia. ¿Te gusta?"). The taquillero ignores chatty questions ("Ponga su tarjeta aquí, por favor."). Daniela's ending is a flat callback ("la pastilla es pequeña también"). Alive scores were 5-7 in these three.
2. **Help requests aren't answered in the way they were asked.** Don Arturo in Oaxaca stayed in Spanish after an English "what does banca mean?" ("Es una silla larga, para sentarse."). Doña Chuy repeated the same phrases when asked to slow down ("Cinco tacos. Sesenta pesos.").
3. **Replies run a bit long for spoken turns, and one ran very long.** Medians of 14-17 words are above the ~10-word norm, and the taquillero's longest turn was 33 words, with 14% of his turns over 30. This is minor elsewhere.

## Recommendations

1. **Give each character one or two concrete personal hooks in the character data, not the prompt.** Examples: Beto has opinions about his town and chats about the route, the taquillero likes asking where people are from, Daniela jokes only when the customer does. Short hooks give the model something specific to react to, and the character prompt stays minimal. Natural recasting ("ah, *me gusta*, sí") will follow more easily once the character is actually engaged with what the learner says.

2. **In `build-turn-prompt.ts`, add a one-line situational note when the learner signals they're lost.** Detect English, "repite", "¿qué es…?" or "más despacio", and add something like "The learner just asked for help in English; answer the question briefly in English, then go back to Spanish." For repeat requests: "They didn't catch it; say it again in different, shorter words, not the same sentence." This fixes the Don Arturo and Doña Chuy misses without simplifying anyone by default.

3. **Add a light spoken-turn note to the turn prompt, aimed at the taquillero's long turns.** For example, "You're talking out loud; say one thing, then let them answer." Length is mostly fine, so keep it to this one line and don't add a hard limit.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 6 | 9 | 8 | 6 | 9 | 7.6 | 14 | 16 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 9 | 5 | 8 | 8.2 | 12 | 17 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 9 | 8 | 7 | 8 | 8.2 | 11 | 16 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 9 | 8.6 | 8 | 11 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 8 | 8 | 9 | 8.6 | 8 | 14 |


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

_Problem: Beto is friendly but generic; he never recasts the learner's errors ("yo me gusta", "a el hotel") and shows little taxi-driver personality beyond stock lines._

```
Beto: ¡Hola, buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: Hola, buenas tardes. Sí, yo necesito un taxi, por favor.
Beto: ¡Perfecto! Mi taxi está aquí, es el amarillo. ¿Vas al centro o a otro lugar?
Learner: No, yo voy a el hotel Casa Linda. ¿Cuánto es, usted?
Beto: ¡Casa Linda! Está cerca. Son setenta pesos. ¿Está bien?
Learner: Sí, está bien. Gracias, usted es muy amable.
Beto: ¡De nada! Tú también eres muy amable. Sube, por favor. ¡Vamos!
Learner: Gracias. ¿Es lejos el hotel, o es cerca?
Beto: Es cerca, solo cinco minutos. ¡Yo conozco todas las calles de San Miguel!
Learner: Ah, cinco minutos, bueno. San Miguel es muy bonito, yo me gusta mucho.
Beto: ¡Sí, es muy bonito! Mira, allí está la Parroquia. ¿Te gusta?
Learner: Sí, la Parroquia es muy bonita. Es muy grande, ¿no?
Beto: ¡Sí, es muy grande! Es mi lugar favorito del centro. ¿Es tu primera vez aquí?
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 7.6

_Problem: When the learner asked in English what 'banca' meant, Don Arturo stayed entirely in Spanish and did not give an English gloss, so the learner's English request for help went unanswered in English._

```
Don Arturo: ¡Buenas tardes! Me llamo Arturo. Me gusta mucho esta plaza. ¿Usted es de aquí?
Learner: Ehm... buenas tardes, Arturo. Yo... no soy de aquí. Soy de... Estados Unidos.
Don Arturo: ¡Qué bien! Estados Unidos está lejos. Aquí hay sol y música. ¿Le gusta la plaza?
Learner: Sí, ehm... me gusta mucho. Es... muy bonita.
Don Arturo: Sí, es muy bonita. Yo vengo aquí todas las tardes. Me gustan los árboles y los niños. ¿Usted prefiere el sol o la sombra?
Learner: Ehm... perdón, no entiendo. ¿Repite, por favor? Más lento.
Don Arturo: Claro, con gusto. Hay sol. Y hay sombra. ¿Usted quiere sol o sombra?
Learner: Ehm... sombra, por favor. Hace mucho... calor.
Don Arturo: Sí, hoy hace mucho calor. Yo también prefiero la sombra. Mire, aquí hay una banca. ¿Se sienta conmigo?
Learner: Ehm... sí, gracias. Ehm... ¿banca? Sorry, what is "banca"?
Don Arturo: Esta, mire. Es una banca. Es una silla larga, para sentarse. Aquí hay sombra. ¿Está bien?
Learner: Ah, ¡una banca! Sí, está bien, gracias. Ehm... ¿usted vive aquí, en Oaxaca?
Don Arturo: Sí, vivo aquí. Toda mi vida. Me gusta mucho el Zócalo. ¿Es su primera vez en Oaxaca?
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.2

_Problem: Don Arturo is a competent but generic ticket-seller who never picks up on the learner's chatty personal questions and curiosity beyond a brief answer, and he doesn't recast or react warmly, so he feels scripted._

```
Don Arturo: ¡Buenas tardes! Soy Arturo. Aquí vendo boletos de autobús. ¿Busca un boleto?
Learner: Buenas tardes, Arturo. Sí, quiero un boleto a Puebla, por favor. Yo llegué a México hace tres semanas, ¿y usted trabaja aquí todos los días?
Don Arturo: ¡Bienvenido a México! Sí, trabajo aquí todos los días. Puebla, muy bien. ¿El boleto es para hoy o para mañana?
Learner: Para hoy, por favor. Mi amigo vive en Puebla y yo visité su casa el año pasado, pero ahora quiero conocer la ciudad. ¿Usted vive cerca de la terminal?
Don Arturo: No, vivo lejos. Voy en metro, casi una hora. Para hoy, muy bien. ¿Quiere boleto sencillo o redondo?
Learner: Perdón, ¿qué significa "redondo"? Una hora en metro es mucho, ¿le gusta?
Don Arturo: Redondo es ida y vuelta: usted va a Puebla y regresa. Sencillo es solo ida. Y no, el metro no me gusta mucho, pero es barato. ¿Quiere solo ida o ida y vuelta?
Learner: Ah, entiendo, gracias. Quiero ida y vuelta, por favor, porque voy a regresar el domingo. ¿Cuánto cuesta?
Don Arturo: Muy bien, ida y vuelta. Son 560 pesos. ¿Paga con efectivo o con tarjeta?
Learner: Con tarjeta, por favor. ¿Y a qué hora sale el autobús?
Don Arturo: Perfecto, con tarjeta. Hay un autobús a las cuatro y otro a las cinco. ¿Cuál quiere?
Learner: Quiero el autobús de las cinco, por favor. ¿Y de qué puerta sale?
Don Arturo: Muy bien, el de las cinco. Sale de la puerta 12. Ponga su tarjeta aquí, por favor.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.6

_Problem: When asked to repeat slowly, she mostly repeats the same phrases without much simplification, and she only slowed down and rephrased clearly once (agua roja/blanca), so her adapting is a bit mechanical._

```
Doña Chuy: ¡Hola, mi vida! Pásale, siéntate aquí. ¿Tienes hambre?
Learner: Ehm... hola. Sí, ehm... yo tengo hambre.
Doña Chuy: ¡Qué bueno! Aquí hay mucha comida rica. Hoy tengo pozole y tacos. ¿Quieres pozole o tacos?
Learner: Ehm... tacos, por favor. ¿Cuánto... cuánto es?
Doña Chuy: Son sesenta pesos, mi vida. Siéntate, yo te llevo los tacos. ¡Te pongo cinco!
Learner: Ehm... ¿cinco? Ehm... sí, gracias. ¿Repite por favor, más lento?
Doña Chuy: Sí, mi vida. Cinco tacos. Sesenta pesos. Siéntate aquí. ¡Ya voy!
Learner: Ehm... okay. Cinco tacos, sesenta pesos. Gracias, señora.
Doña Chuy: ¡Eso, muy bien, mi vida! Ya casi están tus tacos. ¿Quieres agua de jamaica o agua de horchata?
Learner: Ehm... ¿agua de... qué? Perdón, no entiendo. ¿Más despacio, por favor?
Doña Chuy: Sí, mi vida, despacito. Tengo agua roja y agua blanca. ¿Cuál quieres?
Learner: Ehm... agua roja, por favor. Ehm... ¿es... es dulce?
Doña Chuy: Sí, mi vida, es dulce y muy rica. ¡Ya te la traigo! Tus tacos también ya vienen.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.2

_Problem: Her last line is a flat, slightly nonsensical repeat of the earlier 'pequeña' joke, so she feels more scripted than reactive at the end._

```
Daniela: ¡Hola! Soy Daniela. Aquí hay medicina, no hay café. ¿Buscas medicina?
Learner: Hola Daniela. Sí, yo necesito medicina para la dolor de cabeza.
Daniela: Ay, el dolor de cabeza. Te entiendo, es el trabajo de todos. Tengo pastillas. ¿Mucho dolor o poquito?
Learner: Mucho dolor. Yo tengo dolor es... desde la mañana.
Daniela: Uf, desde la mañana es mucho. Tu cabeza no descansa. Tengo una pastilla buena. ¿Quieres agua también?
Learner: Sí, por favor. Yo quiero la agua y la pastilla.
Daniela: Claro. Aquí está el agua y la pastilla. Es pequeña, pero muy seria. Tómala con calma.
Learner: Gracias, Daniela. Perdón, no entiendo "tómala". ¿Repite, por favor?
Daniela: Claro. "Tómala" es "toma la pastilla". Se pone en la boca, y después el agua. No muerde. ¿Sí?
Learner: Sí, entiendo. Gracias. ¿Cuánto es, por favor?
Daniela: Son treinta y cinco pesos. Es barato para una cabeza tan cansada.
Learner: Aquí está, treinta y cinco pesos. Gracias, Daniela. ¿Usted tiene... una bolsa?
Daniela: Sí, claro. Aquí está la bolsa. Es pequeña, pero la pastilla es pequeña también.
```
