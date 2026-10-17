# Conversation test

2026-10-17 04:01 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.6 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.2 |
| adapts | 8.0 |
| alive | 7.2 |
| regional | 9.0 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 9 |
| Reply (median words) | 14 |
| Reply (average words) | 14.1 |
| Longest reply (words) | 22 |
| Replies over 30 words | 0% |
| Questions per reply | 0.4 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

- **Characters are generic and don't react to the learner.** They answer the question and stop, with no opinion, story, or local detail. Examples: "Hay tacos afuera, a la derecha. Son rápidos y buenos." (Iztapalapa goes unremarked), "Y tú, Sam, ¿de dónde eres?" (an echo).
- **Repetition of stock words and phrases.** The same tag lines come back turn after turn: "Siéntese aquí" (Doña Chuy), "amigo" and "Sube" (Beto).
- **Small continuity and consistency slips.** Don Arturo switches from usted to tú mid-conversation, and Beto offers a ride to the ATM after the learner already said they have cash: "¡Perfecto, tienes efectivo! … Yo te llevo, amigo."

## Recommendations

1. **Give each character a few specific details in character data.** Add 2-3 concrete, local things per person: Don Arturo's old job and his favorite spot in the zócalo, Beto's route and a complaint about tourist traffic, Daniela's brand habits and allergy questions, the taquillero's actual taco stand. Add one line to character.md like "You have your own day, opinions, and things you care about." This stays a situation description rather than a speaking rule, and it gives them something to react with when the learner says something interesting (like Iztapalapa).

2. **Pass recent turns and a "don't repeat yourself" cue in build-turn-prompt.ts.** Include the character's last 2-3 lines in the turn prompt, plus a short note that includes the address form in use (usted/tú) and what the learner has already said or done (has cash, already seated). This should address the repeated "Siéntese aquí" and "amigo", the usted→tú slip, and Beto's ATM mix-up with one change.

3. **When the learner asks for "más despacio" or looks lost, rephrase instead of repeating.** In the turn prompt, flag that moment (the learner's literal request or a confused reply) and add a one-line nudge: say it again in different, simpler words, one thing at a time. Don't slow the character down by default; only react when the learner signals trouble. Doña Chuy's "Con calma" followed by the same price and instruction at the same pace is the case to fix.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 7 | 9 | 8.4 | 13 | 14 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 9 | 8 | 6 | 9 | 8.4 | 8 | 14 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 7 | 8 | 9 | 8.4 | 8 | 15 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 9 | 8 | 7 | 9 | 8.6 | 9 | 16 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 9 | 8 | 9 | 9.2 | 9 | 11 |


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

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.4

_Problem: Don Arturo is pleasant but generic, mostly echoing the learner and adding little personality or local flavor, and he abruptly shifts from usted to tú._

```
Don Arturo: ¡Buenas tardes! Qué bonito día en el Zócalo. Me llamo Arturo. ¿Y usted?
Learner: Ehm... buenas tardes. Yo... me llamo Sam. Mucho gusto.
Don Arturo: Mucho gusto, Sam. Bienvenido a Oaxaca. ¿Es su primera vez aquí?
Learner: Ehm... sí. Es mi... primera vez. Es muy bonito.
Don Arturo: Sí, es muy bonito. Yo vengo aquí todos los días, y siempre me gusta.
Learner: Ehm... ¿todos los días? Wow. Ehm... usted... vive aquí?
Don Arturo: Sí, vivo aquí en Oaxaca, cerca del centro. Soy jubilado, así que vengo a ver a la gente.
Learner: Ehm... perdón, "jubilado"... no entiendo. ¿Repite, por favor?
Don Arturo: Claro. Jubilado: ya no trabajo. Tengo setenta y tres años, y ahora descanso en el Zócalo.
Learner: Ah, ya entiendo. Ehm... usted no trabaja. ¡Qué bueno!
Don Arturo: Sí, ¡qué bueno! Ahora trabajo poco: me siento en una banca y miro los árboles. Y tú, Sam, ¿de dónde eres?
Learner: Ehm... yo soy de... Estados Unidos. Ehm... de California.
Don Arturo: ¡California! Está muy lejos. Bienvenido a Oaxaca, Sam.
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.4

_Problem: Beto is friendly but generic and a bit repetitive, repeating 'amigo' and 'Sube' and never reacting with much personality or local color, and he gets muddled about the ATM by offering to take the learner there after they already have cash._

```
Beto: ¡Hola, buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: Hola, buenas tardes. Sí, necesito un taxi, por favor.
Beto: ¡Claro que sí! Mi taxi está aquí, en el Jardín. ¿A dónde vas?
Learner: Voy a el Mercado de Artesanías, por favor. ¿Cuánto cuesta?
Beto: ¡Buen lugar! Al Mercado de Artesanías son setenta pesos. Es un precio bueno, amigo. ¡Vamos!
Learner: Okay, setenta pesos. Gracias, Beto. ¿Es lejos de aquí?
Beto: No, no está lejos. Son diez minutos en mi taxi. ¡Caminando es más largo! Sube, amigo.
Learner: Okay, gracias. ¿Puedo pagar con tarjeta, o solo efectivo?
Beto: Solo efectivo, amigo. Mi taxi no tiene tarjeta. Pero hay un cajero cerca del mercado.
Learner: Okay, tengo efectivo. ¿Dónde está el cajero, por favor?
Beto: ¡Perfecto, tienes efectivo! El cajero está cerca del mercado. Yo te llevo, amigo. Sube.
Learner: Okay, gracias. ¿Puedo sentar en la parte de atrás?
Beto: ¡Claro que sí! Siéntate atrás, amigo. La puerta está abierta. ¡Bienvenido a mi taxi!
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.6

_Problem: Don Arturo is competent and Mexican but somewhat generic; he gives short transactional answers and doesn't pick up the chatty learner's curiosity (e.g., no follow-up about Iztapalapa or a specific taco recommendation)._

```
Don Arturo: Buenas tardes. Bienvenido a la terminal. ¿A dónde va?
Learner: Buenas tardes. Quiero ir a Puebla, por favor. Ayer llegué a la ciudad de México, no, perdón, hace tres semanas, y quiero visitar otras ciudades.
Don Arturo: Puebla, muy bien. Tres semanas aquí, ¡qué bueno! Puebla es bonita. ¿Quiere el autobús para hoy?
Learner: Sí, quiero ir hoy, por favor. ¿Usted es de la ciudad de México? ¿Le gusta trabajar en la terminal?
Don Arturo: Sí, soy de aquí. Me gusta mi trabajo, veo mucha gente. ¿Un boleto?
Learner: Sí, un boleto, por favor. ¿A qué hora sale el próximo autobús y cuánto cuesta?
Don Arturo: El próximo sale a las cuatro y media. Cuesta doscientos treinta pesos. ¿Paga en efectivo?
Learner: Sí, pago en efectivo. ¿Puedo pagar con un billete de quinientos pesos?
Don Arturo: Sí, claro, tengo cambio. Los billetes grandes no me asustan. Aquí tiene: doscientos setenta de cambio y su boleto.
Learner: Gracias, muy amable. ¿Cuánto tiempo es el viaje a Puebla, y de qué número es la puerta?
Don Arturo: El viaje dura unas dos horas. Con el tráfico, a veces más. Es la puerta siete.
Learner: Gracias, don Arturo. ¿Usted vive cerca de la terminal, y qué restaurante me recomienda para comer algo antes del autobús?
Don Arturo: Vivo un poco lejos, en Iztapalapa. Para comer, hay tacos afuera, a la derecha. Son rápidos y buenos. Todavía hay tiempo.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.2

_Problem: Minor: the character never really has to adapt, and the playful lines ('la pastilla también descansa') are a bit twee, with no distinctly Mexican pharmacy touches like asking about allergies or naming a brand._

```
Daniela: ¡Hola! Qué milagro, hoy no hay fila. ¿Qué necesitas?
Learner: Hola. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro, para eso estoy aquí. ¿Te duele mucho?
Learner: Sí, yo tengo mucho dolor. Es muy mal.
Daniela: Uy, lo siento mucho. Un momento, tengo una pastilla para eso.
Learner: Gracias. ¿Cuánto cuesta la pastilla?
Daniela: Cuesta veinte pesos. Es barata. Tu cabeza lo vale.
Learner: Ok, veinte pesos. Yo quiero la pastilla, por favor. Aquí está el dinero.
Daniela: Gracias. Aquí tienes tu pastilla. Toma agua con ella, y tu cabeza va a estar feliz.
Learner: Gracias. ¿Yo tomo la pastilla con agua ahora?
Daniela: Sí, toma la pastilla ahora, con un vaso de agua. Es fácil. Solo una pastilla, no diez.
Learner: Ok, una pastilla. ¿Y yo tomo otra pastilla mañana?
Daniela: Solo si tienes dolor mañana. Si tu cabeza está tranquila, la pastilla también descansa.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.4

_Problem: When the learner asked for 'más despacio', she said 'con calma' but gave the price and an instruction at the same pace without really rephrasing or simplifying, and she repeats 'Siéntese aquí' several times._

```
Doña Chuy: ¡Hola, bienvenido! Pase, pase. Siéntese aquí. ¿Tiene hambre?
Learner: Ehm... hola. Sí, yo... tengo hambre.
Doña Chuy: ¡Qué bueno! Hoy hay mole con pollo. Está muy rico. ¿Le sirvo un plato grande?
Learner: Ehm... ¿mole? Perdón, no entiendo. ¿Repite, por favor?
Doña Chuy: ¡Sí, claro! El mole es una salsa. Es de chile y chocolate. Se come con pollo. ¿Quiere probar?
Learner: Ehm... ¿chocolate? Ehm... sí, yo quiero... probar. Gracias.
Doña Chuy: ¡Muy bien! Ahorita le traigo su plato. Va a ver, le va a gustar. ¿Quiere tortillas?
Learner: Ehm... ¿tortillas? Sí, por favor. Ehm... gracias.
Doña Chuy: ¡Perfecto! Siéntese aquí, por favor. Ya le traigo su mole y sus tortillas calientitas. Le pongo mucho pollo, ¡aquí se come bien!
Learner: Ehm... perdón, más despacio, por favor. Ehm... ¿cuánto... cuesta?
Doña Chuy: Con calma, con calma. Son ochenta pesos. Siéntese aquí. Ya viene su mole.
Learner: Ehm... ¿ochenta? Ehm... sorry, do you speak English?
Doña Chuy: Ay, muy poquito. Ochenta, eighty. Pero mi mole habla por mí. Siéntese, ya viene.
```
