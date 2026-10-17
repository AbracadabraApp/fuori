# Conversation test

2026-10-17 18:48 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: still you, sometimes ask" · 5 conversations · 6 learner turns each

## Grade: 8.6 / 10

| Criterion | Average |
|---|---|
| language | 9.6 |
| understands | 9.6 |
| adapts | 8.4 |
| alive | 6.8 |
| regional | 8.6 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 15 |
| Reply (average words) | 16.9 |
| Longest reply (words) | 26 |
| Replies over 30 words | 0% |
| Questions per reply | 0.9 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run too long for a spoken exchange.** Medians are 21-22 words for both Don Arturos and 14-15 for the others, against a target of about 10. Even Doña Chuy's "¡Ay, perdón, mi vida! Ahorita es ahora. Un momentito. Ya voy con tu pozole. ¿Tienes mucha hambre?" stacks five beats before the learner can speak. The "0% over 30" check is too loose to catch this.
2. **Characters feel generic (alive 6 in three of five).** They ask simple questions and gloss words, but don't react or share anything. Don Arturo asks "¿Quiere probar un tlayuda o un mole?" and offers no opinion. Beto repeats "Conozco todas las calles" and "Qué bueno," with no San Miguel detail.
3. **Weak handling of a lost or erring learner.** Doña Chuy answers "Sorry, what?" with "Ahorita es ahora," which is also an inaccurate gloss, since *ahorita* can mean now or soon. Beto and Daniela let "Es muy bonito la ciudad" and "el dolor de la cabeza" pass without a natural recast. Don Arturo's own slips ("un tlayuda," "le gustó") look like occasional model noise.

## Recommendations

1. **Add one situational line to character.md about how people talk at a counter, in a cab, or in a kitchen.** For example: "This is a live voice conversation. People say a line, maybe two, then let the other person answer." It describes the situation without setting a word limit, and it should bring the 14-22 word medians down toward 10 without any rules.

2. **Give each character 2-3 concrete, specific details in character data.** Examples are Beto's route past the Jardín and the Parroquia and the cobbled hills, and Don Arturo's favorite tlayuda place and a grandson. Add a line telling them to react to what the learner just said, and to offer one detail only when it fits. The details fix the "generic" problem, and short turns can still carry personality (a reaction plus one specific fact).

3. **In build-turn-prompt.ts, flag when the learner is lost or makes a clear error.** If the learner switches to English or says "sorry, what?", add a note that the character may give a brief English gloss and a more accurate explanation, such as "ahorita: right now, or in a bit." For a clear grammar slip, add a note that the character can naturally echo the correct form in their reply ("Sí, qué bonita la ciudad") without correcting. Skip rules for Arturo's own grammar slips and just spot-check them for now.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 8 | 8.0 | 12 | 21 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 8 | 8.4 | 8 | 14 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 9 | 6 | 8 | 8.6 | 7 | 22 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 8 | 8 | 10 | 8.8 | 14 | 15 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 10 | 9 | 8 | 9 | 9.2 | 11 | 14 |


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

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.6

_Problem: Don Arturo is polite but generic and doesn't react much to the learner's personal questions or share anything about himself or the neighbourhood, and he slips in a small grammar error ("Me alegra que le gustó" instead of subjunctive "gustara/haya gustado") and "mucha maleta"._

```
Don Arturo: ¡Buenas tardes! Bienvenido. ¿Va a viajar hoy?
Learner: Buenas tardes, sí, quiero viajar a Puebla. Ayer visité el centro y me gustó mucho, ¿y usted es de aquí?
Don Arturo: Sí, soy de aquí, de la Ciudad de México. Me alegra que le gustó el centro. Puebla es muy bonito. ¿Quiere un boleto para ahora?
Learner: Sí, quiero un boleto para ahora, por favor. ¿Cuánto cuesta y a qué hora sale el autobús?
Don Arturo: Son 250 pesos. El autobús sale en veinte minutos, ¡justo a tiempo! ¿Paga en efectivo o con tarjeta?
Learner: Pago con tarjeta, por favor. ¿Y usted trabaja aquí todos los días?
Don Arturo: Sí, casi todos los días. Ya conozco todos los autobuses. Ponga su tarjeta aquí, por favor. ¿Es su primer viaje a Puebla?
Learner: Sí, es mi primer viaje a Puebla. Estoy muy emocionado, ¿usted recomienda un lugar para comer allá?
Don Arturo: ¡Qué bueno! En Puebla, coma mole poblano. Es muy rico. También hay cemitas, son unos sándwiches grandes. ¿Le gusta el picante?
Learner: Sí, me gusta un poco el picante. Ayer comí tacos al pastor y estuvieron muy ricos, ¿usted come mole mucho?
Don Arturo: Sí, claro, como mole cuando hay fiesta. ¡Los tacos al pastor son los mejores! Aquí, su boleto. Su autobús sale por la puerta cinco.
Learner: Gracias, muy amable. ¿La puerta cinco está cerca de aquí o tengo que caminar mucho?
Don Arturo: Está cerca. Camine recto, unos treinta pasos. Va a ver el número cinco en la pared. ¿Tiene mucha maleta o solo una mochila?
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.0

_Problem: Don Arturo feels like a generic, textbook-style helper rather than a distinct Oaxacan retiree: he mostly asks simple questions and glosses vocabulary without personal anecdotes or reactions, and he says "un tlayuda" (it should be "una")._

```
Don Arturo: ¡Buenas tardes! Hace buen sol hoy en el Zócalo. ¿Es usted turista?
Learner: Ehm... buenas tardes. Sí, yo... ehm... soy turista.
Don Arturo: ¡Qué bueno! Yo soy Arturo. Vivo aquí en Oaxaca, y me gusta mucho esta plaza. ¿Le gusta Oaxaca, sí o no?
Learner: Sí, me gusta... ehm... mucho Oaxaca. Es... bonito.
Don Arturo: Me alegra mucho. Sí, Oaxaca es muy bonito, y la comida es todavía mejor. ¿Quiere probar un tlayuda o un mole?
Learner: Ehm... perdón, ¿cómo? ¿Tla... yuda? Más despacio, por favor.
Don Arturo: Claro, con gusto. Tla-yu-da. Es una tortilla grande, con queso y frijoles. ¿Le gusta el queso?
Learner: Ehm... sí, me gusta el queso. ¿Y... mole? ¿Qué es mole?
Don Arturo: El mole es una salsa oscura, con chile y un poco de chocolate. Se come con pollo. En Oaxaca hay siete moles, ¡y yo quiero todos!
Learner: Ehm... ¿chocolate? ¡Qué interesante! Ehm... yo quiero... la tlayuda, por favor.
Don Arturo: ¡Muy buena elección! La tlayuda es perfecta para empezar. Aquí en el Zócalo hay buenos puestos, y yo conozco uno muy bueno.
Learner: Ehm... perdón, ¿cómo? ¿Puestos? Más despacio, por favor.
Don Arturo: Claro, despacio. Un puesto es una mesita pequeña donde venden comida. Aquí hay muchos. ¿Tiene hambre?
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.4

_Problem: Beto is friendly but generic and repetitive (says 'Conozco todas las calles' twice, 'Qué bueno' repeatedly), gives little San Miguel-specific detail, and doesn't gently recast the learner's errors (e.g. 'Es muy bonito la ciudad')._

```
Beto: ¡Hola, buenas tardes! Soy Beto. ¿Necesitas un taxi?
Learner: Hola, buenas tardes. Sí, yo necesito un taxi, por favor.
Beto: ¡Perfecto! Yo conozco todas las calles. ¿Vas al centro o a otro lugar?
Learner: Eh, yo quiero ir a el mercado de artesanías. ¿Cuánto cuesta?
Beto: ¡Muy bien! El mercado de artesanías está cerca. Cuesta setenta pesos. ¿Te parece bien?
Learner: Sí, setenta pesos está bien. ¿Usted puede ir ahora, por favor?
Beto: ¡Sí, claro! Vamos ahora. Sube, por favor. ¿Es tu primera vez en San Miguel?
Learner: Sí, es mi primera vez. Es muy bonito la ciudad.
Beto: ¡Qué bueno! Sí, la ciudad es muy bonita. Mira, las casas tienen muchos colores. ¿Te gustan?
Learner: Sí, me gustan mucho. Los colores son muy bonitos.
Beto: ¡Qué bueno! A mí me gusta la casa amarilla. Es mi favorita. ¿Y a ti, el amarillo o el rosa?
Learner: Me gusta el rosa. ¿Usted vive en San Miguel?
Beto: ¡Sí, vivo aquí! Conozco todas las calles. El rosa también es bonito. ¿De dónde eres tú?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.8

_Problem: When the learner said "Sorry, what?" about "ahorita", she explained it only in simple Spanish and never used English, and her "ahorita es ahora" gloss is slightly inaccurate for Mexican usage._

```
Doña Chuy: ¡Buenas tardes, mi vida! Pásale, pásale. Hoy hay pozole y tacos dorados. ¿Quieres pozole?
Learner: Ehm... buenas tardes. Ehm... sí, pozole, por favor.
Doña Chuy: ¡Muy bien, mi vida! Siéntate aquí. Te doy un plato bien grande. ¿Rojo o verde?
Learner: Ehm... ¿cómo? Repite, por favor... más lento.
Doña Chuy: ¡Claro, mi vida! Despacito. Pozole... rojo. O pozole... verde. ¿Cuál quieres?
Learner: Ehm... rojo, por favor. Ehm... gracias.
Doña Chuy: ¡Excelente! El rojo es el mejor. Ahorita te lo traigo, bien calientito. Con mucho maíz y carne.
Learner: Ehm... perdón, no entiendo "ahorita". Sorry, what?
Doña Chuy: ¡Ay, perdón, mi vida! Ahorita es ahora. Un momentito. Ya voy con tu pozole. ¿Tienes mucha hambre?
Learner: Ehm... sí, un poco. Ehm... ¿tacos también, por favor?
Doña Chuy: ¡Claro que sí, mi vida! Pozole y tacos. Yo te doy mucho, ¿eh? Tengo tacos de pollo y tacos de res. ¿Cuáles quieres?
Learner: Ehm... pollo, por favor. Ehm... ¿cuánto es?
Doña Chuy: ¡Pollo, muy bien! Son ciento diez pesos. Pagas después, primero comes. ¿Quieres agua de jamaica?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.2

_Problem: Daniela never recasts or models the learner's small errors (e.g. 'el dolor de la cabeza'), and her jokes are fairly generic, so she feels a bit scripted, though nothing is really wrong._

```
Daniela: ¡Hola! Soy Daniela. Aquí hay medicinas y chistes malos. ¿Buscas algo?
Learner: Hola, Daniela. Yo necesito medicina para el dolor de la cabeza.
Daniela: Ay, pobre cabeza. Yo tengo pastillas para eso. ¿Te duele mucho o poco?
Learner: Me duele mucho. Yo tengo el dolor desde ayer.
Daniela: Uy, desde ayer es mucho tiempo. Tu cabeza trabaja demasiado. Tengo una pastilla buena. ¿Quieres una caja pequeña o grande?
Learner: Una caja pequeña, por favor. ¿Cuánto cuesta?
Daniela: Cuesta treinta y cinco pesos. Es barata, pero funciona. ¿Quieres agua también?
Learner: Sí, quiero agua, por favor. ¿Cuánto es todo?
Daniela: Son cincuenta pesos. El agua cuesta quince. Es poco dinero para una cabeza feliz. ¿Efectivo o tarjeta?
Learner: Tarjeta, por favor. Aquí está mi tarjeta.
Daniela: Gracias. Un momento... listo. Aquí está tu medicina y tu agua. Toma la pastilla con comida. ¿Quieres una bolsa?
Learner: Sí, una bolsa, por favor. Gracias, Daniela.
Daniela: Aquí está tu bolsa. Es gratis, no te cobro. Descansa y mejórate pronto, ¿sí?
```
