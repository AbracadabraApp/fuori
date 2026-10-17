# Conversation test

2026-10-17 18:48 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, sometimes ask" · 5 conversations · 6 learner turns each

## Grade: 8.3 / 10

| Criterion | Average |
|---|---|
| language | 9.0 |
| understands | 9.2 |
| adapts | 7.8 |
| alive | 7.0 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 12 |
| Reply (median words) | 18 |
| Reply (average words) | 18.8 |
| Longest reply (words) | 32 |
| Replies over 30 words | 3% |
| Questions per reply | 0.9 |
| Replies asking 2+ questions | 8% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Characters feel generic, with little local color.** "Alive" is 6 for three of the five, e.g. Don Arturo: "Oaxaca es muy bonita, sí. Y el Zócalo es el corazón de la ciudad." Beto repeats "muy bonitos," and the ticket-seller offers "agua o un café" as if he sold it.
2. **Turns run long and stack several moves.** Median replies are 16-23 words in four of five conversations, against a natural ~10. Oaxaca's Don Arturo has 14% of replies over 30 words. Example: "Gracias. Aquí tiene su boleto. Sí, vivo cerca… ¿Tiene su boleto? Ahora, ¿quiere agua o un café…?" That's a reply, an answer, and two questions in one turn.
3. **No natural response to what the learner just did.** Small errors ("Oaxaca es muy bonito," "le gusta los platos") are never recast. When a learner was actually lost ("what is 'horchata'?"), Doña Chuy answered only in Spanish.

## Recommendations

1. **Give each character 2-3 specific details in character data, not rules.** Include a pet opinion, a concrete detail of their place or job, and a habit. For example, Don Arturo in Oaxaca could have a strong view on one market or dish, and the taquillero could have booth details like the window, change, and the line. This fixes the stock topics and the off-role offers, since the character knows what they actually do. The character prompt stays minimal.

2. **Add a one-line turn-shape reminder in `build-turn-prompt.ts`.** Something like: "Answer the way a person would in one breath: one thought, ending in at most one question." Put it in the per-turn prompt, not `character.md`. It keeps the language native-speed and complex but stops the stacked turns, and it leaves room for the learner to answer. Check that median reply length drops toward 10-12.

3. **Add a "react to what the learner just did" line to the turn prompt.** Say: if the learner makes a small error, work the correct form into your reply without comment. If they switch to English or ask what a word means, give a quick English gloss, then go back to Spanish. Keep this tied to evidence. Daniela's pace was fine because the learner showed no confusion, so don't simplify by default.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 8 | 8.0 | 12 | 23 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 8 | 6 | 8 | 8.2 | 12 | 19 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 8 | 8.4 | 8 | 13 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 7 | 9 | 7 | 9 | 10 | 8.4 | 13 | 18 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 9 | 8 | 8 | 8 | 8.4 | 16 | 16 |


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

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.0

_Problem: Don Arturo is pleasant but generic, with little distinctive personality or local Oaxacan color, and he does not gently recast the learner's small errors (e.g., 'Oaxaca es muy bonito'); he just moves on with stock topics._

```
Don Arturo: ¡Buenas tardes! Hace buen sol hoy en el Zócalo. ¿Es usted turista?
Learner: Ehm... buenas tardes. Sí, yo... ehm... soy turista.
Don Arturo: ¡Qué bien! Bienvenido a Oaxaca. Yo me llamo Arturo. Vengo aquí todas las tardes a descansar en una banca. ¿Le gusta el Zócalo?
Learner: Ehm... sí, me gusta. Es... muy bonito. Ehm... yo me llamo... Sam.
Don Arturo: Mucho gusto, Sam. Sí, el Zócalo es muy bonito. Hay árboles y hay música. Aquí hay una banca libre. ¿Quiere sentarse conmigo?
Learner: Ehm... sí, gracias. Ehm... ¿puede repetir? ¿"Sentarse"?
Don Arturo: Claro, Sam. Sentarse es poner el cuerpo en la banca, así. Yo me siento aquí. Por favor, siéntese a mi lado.
Learner: Ah, okay... ehm... gracias, Don Arturo. Yo... me siento.
Don Arturo: ¡Muy bien, Sam! Ahora los dos estamos sentados. Qué buena tarde, ¿verdad? Hace sol, pero no hace mucho calor. ¿Prefiere el sol o la sombra?
Learner: Ehm... ¿sol? Ehm... yo... me gusta el sol. Y usted?
Don Arturo: Yo prefiero la sombra, Sam. Tengo setenta y tres años y el sol es fuerte para mí. Pero usted es joven, y el sol es bueno. ¿Es su primera vez en Oaxaca?
Learner: Ehm... sí, es mi primera... vez. Ehm... Oaxaca es... muy bonito.
Don Arturo: Me alegra, Sam. Oaxaca es muy bonita, sí. Y el Zócalo es el corazón de la ciudad. Mire, allí hay música y niños con globos.
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.4

_Problem: Beto is generic and a bit repetitive (repeats 'muy bonito' and a stock tourist-friendly tone), with little local color, and he never recasts the learner's 'le gusta los platos' error naturally._

```
Beto: ¡Hola, buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: Hola, buenas tardes Beto. Sí, necesito un taxi para el Mercado de Artesanías, por favor.
Beto: ¡Claro que sí! Conozco el camino muy bien. Es rápido. ¿Vamos ahora?
Learner: Sí, vamos ahora. ¿Cuánto cuesta el taxi?
Beto: Son noventa pesos. Es un buen precio, ¿verdad? Sube, por favor. ¿Está bien?
Learner: Sí, está bien. Gracias, Beto.
Beto: ¡De nada! Aquí está mi taxi. Es el amarillo. ¡Vamos al mercado!
Learner: Muy bien. El taxi es muy bonito, Beto. ¿Es lejos el mercado?
Beto: ¡Gracias! Es mi taxi favorito. No es lejos, son diez minutos. ¿Te gustan las artesanías?
Learner: Sí, me gustan las artesanías. Quiero comprar un regalo para mi madre.
Beto: ¡Qué bonito! Tu mamá es muy afortunada. En el mercado hay cosas muy bonitas. ¿Le gustan más las flores de papel o los platos de colores?
Learner: Mmm, a mi madre le gusta los platos de colores. Son muy bonitos.
Beto: ¡Perfecto! Los platos de talavera son famosos aquí. Son muy bonitos y no son caros. ¡Tu mamá va a estar feliz!
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.2

_Problem: Don Arturo feels slightly scripted and generic, with an odd line asking 'Tiene su boleto?' right after handing it over, and he offers water/coffee as if he sold it, with little personality or ticket-booth detail._

```
Don Arturo: ¡Buenas tardes! Soy Arturo. Aquí vendo boletos de autobús. ¿Necesita un boleto?
Learner: Buenas tardes, Don Arturo. Sí, necesito un boleto para Puebla, por favor. ¿Usted trabaja aquí todos los días?
Don Arturo: Sí, trabajo aquí todos los días. ¡Ya son muchos años! Bueno, boleto para Puebla. ¿Para hoy o para mañana?
Learner: Para hoy, por favor. ¿Cuántos años trabaja aquí? Yo llegué a México hace unas semanas y me gusta mucho la ciudad.
Don Arturo: Treinta años aquí. ¡Sí, muchos! Qué bueno que le gusta la ciudad. Para hoy hay autobús a las cuatro. ¿Le sirve?
Learner: Sí, a las cuatro está bien. ¿Cuánto cuesta el boleto, y de qué andén sale el autobús?
Don Arturo: El boleto cuesta doscientos veinte pesos. El autobús sale del andén doce. ¿Paga en efectivo o con tarjeta?
Learner: Pago en efectivo, por favor. ¿Usted vive cerca de la terminal, Don Arturo?
Don Arturo: Gracias. Aquí tiene su boleto. Sí, vivo cerca, en la colonia Moctezuma. Son diez minutos en metro. ¿Tiene su boleto? Ahora, ¿quiere agua o un café para el camino?
Learner: Un agua, por favor. ¿Cómo es la colonia Moctezuma? ¿Es bonita?
Don Arturo: Es una colonia tranquila. Es sencilla, pero a mí me gusta. El agua está en la tienda, a la derecha. ¿Va a Puebla de paseo?
Learner: Sí, voy a Puebla de paseo. Quiero visitar a unos amigos y comer mole poblano. ¿Usted conoce Puebla?
Don Arturo: Sí, conozco Puebla. Mi hermana vive allá. El mole poblano es muy rico. ¿Le gusta el picante?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.4

_Problem: When the learner asked in English "Sorry, what is 'horchata'?", Doña Chuy answered only in Spanish with no English help, so a lost beginner got no real bridge, though the simple explanation partly worked._

```
Doña Chuy: ¡Buenas tardes, mi vida! Pásale, pásale. Hoy hay pollo y arroz. ¿Tienes hambre?
Learner: Ehm... buenas tardes. Sí, yo... tengo hambre.
Doña Chuy: ¡Ay, qué bueno! Siéntate aquí, mi vida. Te doy un plato grande. ¿Quieres pollo o quieres mole?
Learner: Ehm... pollo, por favor. ¿Qué es... "mole"?
Doña Chuy: ¡Claro, mi vida! El mole es una salsa oscura. Tiene chile y un poquito de chocolate. ¡Está muy rico! Te doy pollo con un poquito de mole. ¿Quieres probar?
Learner: Ehm... ¿chocolate? Ehm... sí, un poquito, por favor.
Doña Chuy: ¡Ándale, qué valiente! Ya verás, mi vida, te va a gustar. Aquí está tu plato, bien servido. ¡Come, come!
Learner: Ehm... gracias. Ehm... ¿cuánto es, por favor?
Doña Chuy: Son sesenta pesos, mi vida. Pero primero come, después pagas. ¿Quieres agua de jamaica o agua de horchata?
Learner: Ehm... agua de... ¿jamaica? Sorry, what is "horchata"?
Doña Chuy: ¡Claro, mi vida! La horchata es blanca y dulce. Tiene arroz y canela. La jamaica es roja y un poquito ácida. ¿Cuál quieres?
Learner: Ehm... horchata, por favor. Ehm... gracias.
Doña Chuy: ¡Muy bien! Horchata para ti. Te la traigo bien fría, con mucho hielo. Tú come tu mole, ¿eh?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.4

_Problem: Daniela never slows down or simplifies; her last turn gives a dense dosing explanation and a joke to an A1 learner, though the learner showed no actual confusion, and the dosage is not repeated simply._

```
Daniela: ¡Hola, buenos días! Bienvenido a la Farmacia San Rafael. ¿Buscas algo, o solo quieres aire fresco?
Learner: Buenos días. Yo necesito una medicina para el dolor de cabeza, por favor.
Daniela: Claro, te ayudo. La cabeza es importante, ¡hay que cuidarla! ¿Te duele mucho o poco?
Learner: Me duele mucho. Es... muy fuerte desde ayer.
Daniela: Ay, desde ayer... pobre cabeza. Tengo algo bueno para eso. ¿Prefieres pastillas o jarabe?
Learner: Pastillas, por favor. Yo no gusta el jarabe.
Daniela: Muy bien, pastillas. El jarabe sabe raro, te entiendo. Una pregunta importante: ¿tienes alguna alergia?
Learner: No, no tengo alergias. ¿Cuánto cuesta, por favor?
Daniela: Perfecto, sin alergias. Son 45 pesos. Es barato para un dolor tan grande. ¿Quieres una bolsa?
Learner: Sí, una bolsa, por favor. Aquí está el dinero.
Daniela: Gracias. Aquí tienes tu bolsa y tus pastillas. Toma una con agua. Tu cabeza necesita vacaciones.
Learner: Gracias. ¿Cuántas pastillas... um, una por día?
Daniela: Casi. Una pastilla cada ocho horas: mañana, tarde y noche. Tres al día, no más. Tu cabeza no merece un premio extra.
```
