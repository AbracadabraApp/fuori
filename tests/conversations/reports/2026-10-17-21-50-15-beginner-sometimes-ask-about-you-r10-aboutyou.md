# Conversation test

2026-10-17 21:50 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: sometimes ask, about you" · 5 conversations · 6 learner turns each

## Grade: 8.4 / 10

| Criterion | Average |
|---|---|
| language | 9.4 |
| understands | 9.2 |
| adapts | 8.0 |
| alive | 7.0 |
| regional | 8.4 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 18 |
| Reply (median words) | 21 |
| Reply (average words) | 21.7 |
| Longest reply (words) | 31 |
| Replies over 30 words | 3% |
| Questions per reply | 0.8 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run about twice the natural length.** Median is 18–25 words against roughly 10 for a real turn, and openers are 10–20 words. "No hay problema, Sam. Caliente es con calor. La taza de chocolate está caliente. El helado es frío, no caliente. ¿Le gusta el chocolate caliente o frío?" leaves the learner no room. The "0% over 30" metric hides this.
2. **The characters feel generic, with a question on every turn.** The three lowest "alive" scores (6) are Beto and both Don Arturos. "En Puebla me gustan las cemitas. ¿Prefiere mole o cemita?" is a brochure line plus a reflexive question, not a person with a past.
3. **Help for a lost learner is weak or off-target.** Beto comments on the learner's Spanish ("¡Y tú no tienes que decirme usted, soy Beto!") instead of just using the right form back. Arturo explains "caliente" with only simpler Spanish and no anchor. Daniela's "Aquí, abajo. Con el chip para arriba. Tranquilo, la terminal no muerde." is ambiguous and adds an idiom.

## Recommendations

1. **Add a one-line reminder in `build-turn-prompt.ts`, not a rule in `character.md`.** Something like "This is spoken aloud; say one breath, then let them answer." Place it at the end of each turn prompt, where it carries the most weight. This addresses the length problem without turning the character prompt into a rulebook.
2. **Give each character 2–3 concrete specifics in character data.** Examples: Beto's usual routes, a nephew, what tourists get wrong; Arturo's years at the window and a regular he remembers; the Oaxacan retiree's chocolate-with-water habit and his old job. Add "volunteer one of these when the learner shows curiosity, and don't end every turn with a question." This fixes the flat "alive" scores and the tacked-on questions.
3. **When the learner is clearly lost (a "¿qué?", English, a long pause), have the character show instead of re-explaining.** Use a cognate, point at something in the scene, or give one short example ("Caliente, como el chocolate. ¡Cuidado!"). Don't comment on the learner's usted/tú mixing; just answer in the correct form. Apply this only when the learner is lost; fast, idiomatic speech is fine otherwise.

Daniela and Doña Chuy are in good shape (alive 8–9). Leave them alone, since their issues are one idiom each and Daniela already clarified when asked.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 9 | 9 | 8 | 6 | 8 | 8.0 | 18 | 24 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 9 | 8 | 6 | 8 | 8.2 | 12 | 21 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 8 | 6 | 8 | 8.4 | 10 | 25 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 9 | 8 | 8 | 9 | 8.6 | 20 | 18 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 9 | 9 | 8 | 9 | 9 | 8.8 | 18 | 20 |


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

_Problem: Beto comments on the learner's usted/tú mixing and praises the Spanish instead of just recasting it, and he feels generic, like a tourism brochure with little taxi-driver personality or local slang._

```
Beto: ¡Hola, buenas tardes! Soy Beto. Este es mi taxi. ¿Necesitas un taxi?
Learner: Hola, buenas tardes. Sí, yo necesito un taxi para el mercado, por favor.
Beto: ¡Claro! Vamos al mercado. Está cerca, son cinco minutos. ¿Es tu primera vez en San Miguel?
Learner: Sí, es mi primera vez. Es muy bonito.
Beto: ¡Sí, es muy bonito! Yo amo mi ciudad. Aquí todo es de colores. Sube, por favor. ¿Quieres ir por la calle bonita o por la calle rápida?
Learner: Por la calle bonita, por favor. Yo no tengo prisa.
Beto: ¡Perfecto! Yo también prefiero la calle bonita. Tiene casas amarillas, azules y rojas. Y ves la iglesia grande, la Parroquia. ¡Vamos!
Learner: ¡Qué bonito! La iglesia es muy grande. ¿Usted vive aquí?
Beto: ¡Sí, vivo aquí! Nací aquí y trabajo en el Jardín todos los días. Conozco todas las calles. ¡Y tú no tienes que decirme usted, soy Beto!
Learner: Ah, perdón. ¿Tú vives aquí... eh, tú eres de San Miguel, Beto?
Beto: ¡Sí, soy de San Miguel! No hay problema, tu español está muy bien. Mi familia vive aquí y mi taxi es mi segundo hogar. ¿Y tú, de dónde eres?
Learner: Yo soy de Estados Unidos, de Texas. Es mi primera vez en México.
Beto: ¡Texas! ¡Qué bien! Bienvenido a México. Aquí en San Miguel hay muchos turistas de Texas. ¿Te gusta la comida mexicana?
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.4

_Problem: Don Arturo reads like a scripted ticket-seller, with short generic answers, almost no personal touches or anecdotes, and a question tacked onto every turn, and he never reacts to the learner's chatty curiosity about him beyond a one-line answer._

```
Don Arturo: ¡Buenas tardes! Bienvenido a la terminal. ¿Va a viajar hoy?
Learner: Buenas tardes, sí, quiero viajar a Puebla. Ayer visité el centro y hoy quiero conocer otra ciudad, ¿usted conoce Puebla?
Don Arturo: ¡Claro que sí! Conozco Puebla. Es bonita y tiene un mole muy rico. Hay autobuses a Puebla cada rato. ¿Quiere boleto de ida o de ida y vuelta?
Learner: Ida y vuelta, por favor. ¿Cuánto cuesta el boleto y a qué hora sale el próximo autobús?
Don Arturo: Muy bien. Ida y vuelta cuesta cuatrocientos cincuenta pesos. El próximo autobús sale a las cuatro. ¿Le sirve esa hora?
Learner: Sí, a las cuatro está bien. ¿Y a qué hora llega a Puebla? Quiero comer mole cuando llegue.
Don Arturo: ¡Qué buen plan! Llega a Puebla a las seis, más o menos. A esa hora el mole todavía está caliente. ¿Paga con tarjeta o con efectivo?
Learner: Con efectivo, por favor. ¿Usted vive cerca de la terminal, y qué le gusta comer cuando visita Puebla?
Don Arturo: Perfecto, en efectivo. Son cuatrocientos cincuenta pesos. Sí, vivo cerca, en el Centro. En Puebla me gustan las cemitas. ¿Prefiere mole o cemita?
Learner: Prefiero el mole, pero nunca probé las cemitas. ¿Qué es una cemita? Aquí está el dinero, cuatrocientos cincuenta pesos.
Don Arturo: Gracias, aquí está su boleto. La cemita es un pan con carne, queso y salsa. Es grande y muy rica. ¿Quiere probar una en Puebla?
Learner: Sí, quiero probar una cemita también. ¿Dónde puedo comprar una buena en Puebla?
Don Arturo: Cerca del centro hay muchos puestos. Busque la calle 5 de Mayo, ahí hay buenas cemitas. Pregunte a la gente y le dicen dónde. ¿Le gusta el picante?
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.0

_Problem: Don Arturo's explanation of 'caliente' is in simplified Spanish only, with no gesture or cognate to anchor it, and the character stays a generic friendly guide rather than a distinct Oaxacan retiree with his own stories._

```
Don Arturo: ¡Buenas tardes! Qué bonito día en el Zócalo. Me llamo Arturo. ¿Usted es de aquí, o es turista?
Learner: Ehm... buenas tardes. Yo... soy turista. Me llamo Sam.
Don Arturo: Mucho gusto, Sam. Bienvenido a Oaxaca. Yo vengo aquí todas las tardes, me gustan los árboles y la música. ¿Es su primera vez aquí?
Learner: Ehm... sí. Es mi... primera vez. Me gusta... Oaxaca.
Don Arturo: ¡Qué bueno, Sam! A mí también me gusta mucho. Mire, allá hay un señor con globos de colores. Es muy típico del Zócalo. ¿Le gustan los globos?
Learner: Ehm... sí, me gustan... los globos. Ehm... ¿repite por favor? Más lento.
Don Arturo: Claro, Sam. Con gusto. Mire, allá hay un señor. Tiene globos. Son de colores. ¿Los ve?
Learner: Ehm... sí, veo los globos. Son... bonitos. ¿Usted... ehm... vive aquí?
Don Arturo: Sí, Sam, vivo aquí. Mi casa está cerca del Zócalo. Y sí, los globos son muy bonitos. Oaxaca es famosa por el chocolate. ¿Le gusta más el café o el chocolate?
Learner: Ehm... el chocolate. Me gusta... el chocolate. ¿Y usted?
Don Arturo: A mí también me gusta el chocolate, Sam. Por la tarde, tomo chocolate caliente con pan. Es muy oaxaqueño. ¿Usted toma chocolate caliente?
Learner: Ehm... perdón, ¿caliente? No entiendo la palabra.
Don Arturo: No hay problema, Sam. Caliente es con calor. La taza de chocolate está caliente. El helado es frío, no caliente. ¿Le gusta el chocolate caliente o frío?
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.6

_Problem: Daniela's 'Aquí, abajo. Con el chip para arriba' is ambiguous and the 'la terminal no muerde' joke adds idiom for an A1 learner, though she does clarify when asked._

```
Daniela: ¡Hola, buenas tardes! Bienvenido a la Farmacia San Rafael. Soy Daniela. ¿Buscas algo, o solo vienes a ver las vitaminas?
Learner: Hola, buenas tardes. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro, con gusto. Pobre cabeza, trabaja mucho. Tengo pastillas aquí. ¿Te duele mucho o poco?
Learner: Me duele mucho. Yo tengo... dolor de cabeza desde la mañana.
Daniela: Uy, desde la mañana es mucho. Tu cabeza necesita vacaciones. Aquí tengo unas pastillas buenas. ¿Quieres agua también?
Learner: Sí, quiero agua, por favor. ¿Cuánto cuesta las pastillas?
Daniela: Aquí está tu agua. Las pastillas cuestan treinta y cinco pesos, y el agua quince. Son cincuenta pesos. Es barato para una cabeza feliz. ¿Pagas con efectivo o con tarjeta?
Learner: Con tarjeta, por favor. ¿Es posible?
Daniela: Sí, es posible. Aquí está la terminal. Pon tu tarjeta, por favor. Yo espero, mi cabeza está muy bien hoy.
Learner: Okay... gracias. ¿Es la tarjeta aquí o aquí?
Daniela: Aquí, abajo. Con el chip para arriba. Tranquilo, la terminal no muerde.
Learner: Perdón, ¿cómo? ¿El chip arriba o abajo?
Daniela: El chip va arriba. Así, mira. Yo te ayudo. Muy bien, ya está.
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.8

_Problem: Minor: slightly mixed register ("Siéntate"/"Come" tú forms are fine), and "no se enfría" is mildly idiomatic for an A1, but nothing significantly wrong._

```
Doña Chuy: ¡Hola, mi cielo! Bienvenido a mi cocina. Yo soy Doña Chuy. Hoy hay pozole y tacos. ¿Tienes hambre?
Learner: Ehm... hola. Yo... sí, un poco hambre... ¿Qué es pozole?
Doña Chuy: ¡Ay, qué bueno! El pozole es una sopa caliente con maíz y carne de puerco. Es muy rico. Yo te doy un plato grande. ¿Pozole o tacos?
Learner: Ehm... pozole, por favor. ¿Es... picante?
Doña Chuy: ¡Muy bien, mi cielo! Siéntate, yo te sirvo. No, el pozole no es picante. El chile va aparte, en la mesa. ¿Quieres chile, sí o no?
Learner: Ehm... no, gracias. Sin chile, por favor.
Doña Chuy: ¡Perfecto, sin chile! Aquí tienes tu pozole, bien caliente. Yo te pongo mucha carne, porque estás flaquito. ¡A comer!
Learner: Ehm... gracias. Perdón, ¿"flaquito"? No entiendo.
Doña Chuy: ¡Ja, ja! Flaquito es delgado, con poquito cuerpo. No es malo, mi cielo. Pero aquí en mi cocina nadie se queda flaquito. Come, come.
Learner: Ehm... ja, ja. Gracias, Doña Chuy. Ehm... ¿cuánto es, por favor?
Doña Chuy: Son ochenta pesos, mi cielo. Es barato, ¿verdad? Pero primero come, después pagas. ¿Quieres agua de jamaica o de horchata?
Learner: Ehm... agua de... horchata, por favor. Gracias.
Doña Chuy: ¡Buena elección! La horchata es dulce y fría. Ahorita te la traigo. Tú come tu pozole, ¡no se enfría!
```
