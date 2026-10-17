# Conversation test

2026-10-17 21:50 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: sometimes ask, about you" · learner taps reply buttons (replies 2026-10-17) · 5 conversations · 6 learner turns each

## Grade: 8.5 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.4 |
| adapts | 8.0 |
| alive | 7.0 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 19 |
| Reply (average words) | 18.4 |
| Longest reply (words) | 27 |
| Replies over 30 words | 0% |
| Questions per reply | 0.9 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems
1. **Replies run about twice as long as real turns.** Median replies are 15-25 words, against about 10 for natural talk. Don Arturo (Oaxaca) is the worst: "Esta es mi banca favorita. Bueno, hoy usted está aquí, y eso es bueno." The 0% over 30 stat hides this because 30 is too lenient a bar.
2. **Almost every turn ends with a filler question.** This makes the characters sound like questionnaires: "¿Le gusta la ciudad?", "¿Quieres algo más aquí?", "¿Es tu primer día?"
3. **Characters repeat themselves and feel generic.** Beto re-introduces himself and repeats the heat comment. Don Arturo (Oaxaca) keeps returning to the bench and the shade. Little specific local color shows up.

## Recommendations
1. **Add one situational line about spoken pace to `character.md`.** For example: "Esto es una charla hablada: responde como en la vida real, en una o dos frases cortas, y deja espacio para que la otra persona hable." It describes the medium rather than setting a word limit, so it fits the minimal prompt, and it should bring replies toward 10 words. Also flag replies over about 15 words in grading, not just over 30.
2. **Loosen the question habit in the same line or a short second one:** "No termines cada turno con una pregunta; a veces solo reacciona a lo que dijo la persona." Reacting to something specific the learner said is what makes a character feel alive, and it should fix most of the "scripted routine" feel in Doña Chuy, Daniela, and Don Arturo (CDMX).
3. **Fix repetition at the source in `build-turn-prompt.ts` and the character data.** Check that the character's own earlier turns are in the history sent each turn. Beto re-introducing himself suggests they may not be. Then give each character 2-3 concrete details in the data (a TAPO regular, a San Miguel street complaint, an Oaxaca bench neighbor) to bring up one at a time, instead of circling the same setting detail.

Don't chase the small phrasing issues ("gafas" vs "lentes", "trabajo aquí hace…") yet. They are minor, and shorter turns with more specific content may reduce them. Also run a few tests where the learner is visibly lost, since adaptation hasn't really been tested with the hesitant and improving learners.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 7 | 7 | 9 | 8.2 | 17 | 25 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 8 | 6 | 8 | 8.2 | 10 | 21 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 9 | 8 | 8 | 7 | 8.2 | 11 | 15 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 8 | 8.4 | 8 | 15 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 10 | 10 | 9 | 8 | 10 | 9.4 | 14 | 19 |


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

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.2

_Problem: The learner never signalled confusion, so adaptation is barely tested, and Don Arturo mostly repeats his bench and shade details instead of asking new questions or reacting to anything specific._

```
Don Arturo: ¡Buenas tardes! Me llamo Arturo. Me gusta mucho este lugar. ¿Es su primera vez en el Zócalo?
Learner: Sí, es mi primera vez en el Zócalo.
Don Arturo: ¡Qué bien! Yo vengo aquí todos los días. Me gustan los árboles y la gente. ¿Le gusta el Zócalo?
Learner: Sí, me gusta mucho el Zócalo.
Don Arturo: Me alegra mucho. Yo me siento siempre en esta banca, debajo de un árbol. Me gusta la sombra. ¿Usted prefiere el sol o la sombra?
Learner: Prefiero el sol.
Don Arturo: ¡Ah, el sol! Usted es valiente. Yo tengo setenta y tres años, y el sol me cansa. Hoy hay mucha gente en el Zócalo. ¿Escucha la música?
Learner: No, no escucho la música, hay mucha gente.
Don Arturo: Tiene razón, hoy hay mucho ruido. Pero a veces hay música aquí, en el kiosco. Es muy bonita. Yo la escucho casi todas las tardes.
Learner: Me gusta la música del kiosco.
Don Arturo: ¡Qué bueno! A mí también me gusta mucho. Cuando toca la banda, yo me quedo en mi banca y me siento feliz. ¿Usted viene mañana al Zócalo?
Learner: No, mañana no vengo al Zócalo.
Don Arturo: Ah, qué pena. Mañana yo sí vengo, como siempre. Esta es mi banca favorita. Bueno, hoy usted está aquí, y eso es bueno.
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.4

_Problem: Beto feels generic and repetitive: he re-introduces himself after already saying his name and repeats the heat comment, with little distinct personality or local color._

```
Beto: ¡Hola, buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: No, no necesito un taxi, gracias.
Beto: ¡Ah, qué bien! Solo caminas, ¿verdad? El Jardín es muy bonito hoy. ¿Te gusta?
Learner: Sí, me gusta, pero hace mucho calor.
Beto: ¡Sí, mucho calor! Yo estoy aquí en la sombra, con los árboles. ¿Quieres un helado o un agua?
Learner: Quiero un helado, por favor.
Beto: ¡Buena idea! Hay helados allí, cerca de la Parroquia. Yo quiero uno de limón. ¿Y tú, fresa o limón?
Learner: Quiero uno de limón, como tú.
Beto: ¡Ja, ja! Muy bien, somos iguales. Me llamo Beto. Soy taxista aquí en el Jardín.
Learner: Mucho gusto, Beto. Soy turista.
Beto: ¡Mucho gusto! Bienvenido a San Miguel. Aquí todo es bonito, pero hoy hace mucho calor. ¿Es tu primer día?
Learner: No, no es mi primer día.
Beto: ¡Qué bien! Entonces ya conoces el Jardín. Yo conozco todas las calles de aquí. ¡Todas!
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.2

_Problem: Don Arturo sounds like a scripted questionnaire: nearly every turn ends with a generic question, with little TAPO-specific colour, and his phrasing is slightly off ("trabajo aquí hace muchos años" instead of "llevo muchos años trabajando aquí")._

```
Don Arturo: ¡Buenas tardes! Bienvenido a la terminal. ¿Va a viajar hoy?
Learner: Sí, voy a viajar a Guadalajara.
Don Arturo: ¡Guadalajara! Qué bonito. Pero aquí no salen autobuses para allá. Salen de la Terminal Norte. ¿Entiende?
Learner: Sí, entiendo. ¿Cómo llego a la Terminal Norte?
Don Arturo: Está un poco lejos. Puede ir en metro o en taxi. El metro es barato, pero el taxi es más fácil. ¿Qué prefiere?
Learner: Prefiero ir en metro porque es barato.
Don Arturo: ¡Buena idea! Yo también uso el metro todos los días. La estación está aquí cerca, se llama San Lázaro. ¿Quiere ayuda con el camino?
Learner: No, gracias, no quiero ayuda con el camino.
Don Arturo: Muy bien, como usted quiera. Solo una cosa: lleve su boleto y cuide su mochila en el metro. ¿Es su primer viaje a México?
Learner: Sí, es mi primer viaje a México.
Don Arturo: ¡Bienvenido a México! Yo trabajo aquí hace muchos años y me gusta ver gente de todos lados. ¿Le gusta la ciudad?
Learner: Me gusta un poco la ciudad.
Don Arturo: Un poco está bien. ¡La ciudad es grande y hace mucho ruido! Pero yo la quiero. ¿Le gusta la comida mexicana?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.2

_Problem: Minor: "gafas" is understood fine, but the character offers no distinctly Mexican vocabulary or expressions (e.g., "lentes" would be more typical in Mexico), and the replies are a bit formulaic with the repeated "¿Algo más?"._

```
Daniela: ¡Hola, buenas! Soy Daniela. Aquí vendemos medicinas, no tacos. ¿Buscas algo?
Learner: Busco una crema para el sol.
Daniela: ¡Claro! Hoy hay mucho sol, buena idea. ¿Es para la cara o para el cuerpo?
Learner: Es para el cuerpo.
Daniela: Muy bien, el cuerpo también merece cuidado. Tengo dos: una en spray y otra en crema. ¿Cuál prefieres?
Learner: Prefiero la de spray, por favor.
Daniela: Perfecto, aquí está. Es buena para la espalda, donde nunca llegas. ¿Algo más?
Learner: Sí, necesito una crema para la cara.
Daniela: Claro, la cara siempre está al frente, pobrecita. Tengo una muy buena. ¿La quieres grande o pequeña?
Learner: La quiero grande, por favor.
Daniela: Aquí está la grande. Con el sol de Puebla, es buena idea. ¿Algo más?
Learner: Sí, necesito unas gafas de sol.
Daniela: Ay, aquí en la farmacia no vendemos gafas. Pero hay una óptica en la esquina. ¿Quieres algo más aquí?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 9.4

_Problem: Every turn ends with another question (con limón/tostada/jamaica), which feels a bit like a scripted ordering routine, though the learner never signals confusion so adaptation isn't really tested._

```
Doña Chuy: ¡Buenas tardes, mi vida! Pásale, pásale. Hoy hay pozole y tacos dorados. ¿Tienes hambre?
Learner: Sí, tengo mucha hambre.
Doña Chuy: ¡Qué bueno! Aquí nadie se va con hambre. Siéntate, mi vida. ¿Quieres pozole o tacos?
Learner: Quiero pozole, por favor.
Doña Chuy: ¡Ay, qué bueno! Es el pozole rojo de mi mamá. Te pongo un platote. ¿Con limón o sin limón?
Learner: Quiero el pozole con limón, por favor.
Doña Chuy: ¡Con limón, como debe ser! Ahorita te traigo tu platote, bien caliente. ¿Quieres agua de jamaica?
Learner: Sí, quiero agua de jamaica, por favor.
Doña Chuy: ¡Perfecto! La jamaica la hago yo todos los días, bien fresquecita. Ya casi está tu pozole. ¿Con tostada o con tortilla?
Learner: Quiero el pozole con tostada, por favor.
Doña Chuy: ¡Con tostada, muy bien! Yo también la prefiero así, bien crujiente. Aquí tienes tu pozole y tu jamaica, mi vida. ¡Come, come!
Learner: Muchas gracias, la jamaica se ve muy rica.
Doña Chuy: ¡De nada, mi vida! Sí, está bien rica. Tiene mucha flor de jamaica y poquito azúcar. Pruébala, pruébala. ¿Está buena?
```
