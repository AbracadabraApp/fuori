# Conversation test

2026-10-17 18:38 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.7 / 10

| Criterion | Average |
|---|---|
| language | 9.4 |
| understands | 9.2 |
| adapts | 8.2 |
| alive | 7.8 |
| regional | 8.8 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 9 |
| Reply (median words) | 17 |
| Reply (average words) | 16.2 |
| Longest reply (words) | 23 |
| Replies over 30 words | 0% |
| Questions per reply | 0.6 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run longer than a real turn.** Median reply is 13-19 words in every conversation (longest 23), against ~10 for natural speech. Replies often stack three or four statements: "Pruebe un tlayuda. Es grande, con queso y frijoles. Es muy típica de Oaxaca. ¡Y muy rica!" That leaves the learner little to respond to.
2. **When the learner is lost, the repair is weak.** Don Arturo says "Despacio" and repeats himself. Doña Chuy answers "Bastante es mucho, mi vida" in Spanish only, to someone who said "Sorry, what...?" Adapts scores drop to 7-8 in exactly these cases.
3. **Some characters sound generic.** Don Arturo at TAPO: "Es un barrio muy ocupado... ¡Los tacos aquí son los mejores!" That is warm but could be said about any neighbourhood (alive 7).

The rest is minor. The tlayuda gender slip, the missing "¿", Beto's "a la izquierda" and Daniela's tú/usted are one-offs, and I wouldn't change anything for them.

## Recommendations

1. **Add one line to `character.md` about the medium, not a word limit.** Something like: "Esto es una charla hablada, en persona: dices una cosa a la vez y dejas que la otra persona conteste." It describes the situation, fits the minimal prompt, and should cut the stacked statements without capping length.
2. **Add one line to `character.md` about what a real local does when someone is stuck.** For example: "Si la persona no entiende o se pierde, la ayudas como lo haría alguien de ahí: lo dices de otra forma, con otras palabras o con un ejemplo, y si de plano está atorada, una palabra en inglés." This targets the repeat-the-same-sentence and Spanish-only failures, and doesn't simplify speech for learners who aren't lost.
3. **Give Don Arturo (and any flat character) a few concrete local details in the character data.** For example, specific things he sees and hears at TAPO each day: the buses leaving, a particular stand, a regular customer, a street name. The model then has something specific to draw on instead of "muy ocupado" and "los mejores."

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 10 | 9 | 7 | 7 | 9 | 8.4 | 14 | 19 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 8 | 9 | 8 | 8 | 9 | 8.4 | 7 | 17 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 9 | 7 | 8 | 8.8 | 9 | 17 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 9 | 9 | 9 | 8 | 9 | 8.8 | 7 | 13 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 10 | 9 | 8 | 9 | 9 | 9.0 | 14 | 17 |


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

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.8

_Problem: Don Arturo is warm but a bit generic, with short, flat replies ("muy ocupado", "los mejores") that give little local detail about the TAPO neighbourhood, though the suadero answer is good._

```
Don Arturo: Buenas tardes. Bienvenido a la terminal. ¿A dónde va?
Learner: Buenas tardes. Quiero ir a Puebla, por favor. Ayer visité el centro de la ciudad y hoy quiero conocer otro lugar.
Don Arturo: ¡Puebla! Muy buena idea. Allá hay mucho que ver. ¿Quiere salir ahora?
Learner: Sí, quiero salir ahora, por favor. ¿Cuánto cuesta el boleto y a qué hora sale el próximo autobús?
Don Arturo: El boleto cuesta 230 pesos. El próximo autobús sale a las cuatro y media. ¡Tiene suerte!
Learner: Perfecto, gracias. ¿Usted es de la Ciudad de México? Yo llevo tres semanas aquí y me gusta mucho.
Don Arturo: Sí, soy de aquí, de la ciudad. Llevo treinta años en esta ventanilla. ¡Me alegra que le guste!
Learner: ¡Treinta años! Es mucho tiempo. ¿Cómo es el barrio de la terminal? Ayer comí tacos cerca del hotel y fueron muy ricos.
Don Arturo: Es un barrio muy ocupado. Hay mucha gente y mucha comida. ¡Los tacos aquí son los mejores!
Learner: Qué bien. ¿Usted come tacos aquí todos los días? ¿Cuál es su favorito?
Don Arturo: Casi todos los días, sí. Mi favorito es el taco de suadero, con mucha salsa. ¡Treinta años y no me aburro!
Learner: ¿Suadero? No sé qué es. ¿Es de carne de res o de cerdo?
Don Arturo: Es de res. Es carne suave y muy rica. ¡Tiene que probarlo antes de salir de la ciudad!
```

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 8.4

_Problem: When asked to slow down, Don Arturo says 'Despacio' and mostly repeats the same sentences without really simplifying them, and he misgenders 'un tlayuda' (tlayuda is feminine)._

```
Don Arturo: ¡Buenas tardes! Hace buen sol hoy en el Zócalo. Me llamo Arturo. ¿Y usted?
Learner: Ehm... buenas tardes. Yo... me llamo Sam. Mucho gusto.
Don Arturo: Mucho gusto, Sam. Bienvenido a Oaxaca. Me gusta sentarme aquí, en esta banca, y ver a la gente. ¿Es su primera vez aquí?
Learner: Ehm... sí. Es mi... primera vez. ¿Repite por favor, más lento?
Don Arturo: Claro, Sam. Despacio. Me gusta estar aquí. Veo a la gente. ¡Primera vez! Qué bien. ¿Le gusta el Zócalo?
Learner: Ehm... sí, me gusta. Es... bonito. ¿Y usted... vive aquí?
Don Arturo: Sí, vivo aquí, en Oaxaca. Mi casa está cerca. Esta banca es mi oficina. ¿Y usted, de dónde es?
Learner: Ehm... yo soy de... Estados Unidos. ¿Y usted... es de Oaxaca?
Don Arturo: Sí, soy de Oaxaca. Toda mi vida vivo aquí. Estados Unidos, qué lejos. ¿Tiene hambre? Aquí hay buena comida.
Learner: Ehm... sí, un poco. ¿Qué... recomienda? Sorry, ¿más lento, por favor?
Don Arturo: Con gusto, Sam. Despacio. Pruebe un tlayuda. Es grande, con queso y frijoles. Es muy típica de Oaxaca. ¡Y muy rica!
Learner: Ehm... tlayuda. ¿Dónde... hay una buena? Ehm... ¿cerca de aquí?
Don Arturo: Sí, muy cerca. Camine por esa calle, dos cuadras. Hay puestos con una tlayuda muy rica. Huele increíble.
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.8

_Problem: Minor: the character says 'aquí a la izquierda está el Jardín' though they're at the Jardín Allende taxi stand, and the '¡Qué bonito, verdad?' is missing an opening mark; otherwise very natural._

```
Beto: ¡Hola, buenas! Soy Beto. ¿Necesitas un taxi?
Learner: Hola Beto. Sí, yo necesito un taxi para el Mercado de Artesanías, por favor.
Beto: ¡Claro que sí! Yo conozco todas las calles. Mi taxi está aquí. ¿Vamos?
Learner: Sí, vamos. ¿Cuánto cuesta el taxi?
Beto: Son setenta pesos. ¡Es barato, y la plática es gratis! Sube, por favor.
Learner: Ok, setenta pesos está bien. Gracias, Beto.
Beto: ¡De nada! Ahorita arrancamos. El mercado está cerca, pero yo voy con calma.
Learner: Ok, el mercado está cerca. Perdón, ¿qué es "con calma"?
Beto: ¡Buena pregunta! "Con calma" es despacio, tranquilo. Yo no corro. ¡Soy taxista, no piloto!
Learner: Ah, despacio. Ok, me gusta. Yo no quiero un piloto, jaja.
Beto: ¡Jaja! Perfecto, entonces. Mira, aquí a la izquierda está el Jardín. ¡Qué bonito, verdad?
Learner: Sí, es muy bonito. El jardín es grande, y la iglesia es bonita también.
Beto: ¡Sí! Es la Parroquia. Es rosa y muy alta. Yo la veo todos los días, ¡y nunca me aburro! ¿Te gusta?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.4

_Problem: When the learner said 'Sorry, what... bastante?' in English, she stayed entirely in Spanish and gave a slightly inaccurate gloss ('bastante es mucho'), with no English help for a lost beginner._

```
Doña Chuy: ¡Hola, mi vida! Pase, siéntese. ¿Tiene hambre?
Learner: Ehm... hola. Sí... yo... tengo hambre.
Doña Chuy: ¡Qué bueno! Siéntese aquí, mi vida. Hoy hay pozole. ¿Quiere pozole?
Learner: Ehm... ¿pozole? Perdón... ¿qué es pozole?
Doña Chuy: Es una sopa, mi vida. Mire, aquí en la olla. Tiene carne y maíz. ¡Está muy rico! ¿Quiere probar?
Learner: Ehm... sí, por favor. Yo... quiero probar. ¿Es... picante?
Doña Chuy: No mucho, mi vida. El chile va aparte, usted decide. Ahorita le sirvo un plato grande. ¿Sí?
Learner: Ehm... ¿cómo? Más despacio, por favor. ¿"Aparte"... qué es?
Doña Chuy: Aparte es separado, mi vida. Mire, el chile está en este plato. Usted lo pone si quiere.
Learner: Ah, ok... el chile es separado. Ehm... sí, un plato, por favor. Gracias.
Doña Chuy: ¡Muy bien, mi vida! Siéntese aquí. Ya le sirvo, y le pongo bastante carne. ¡Aquí nadie se queda con hambre!
Learner: Ehm... gracias. Sorry, what... "bastante"? Ehm... ¿qué es?
Doña Chuy: Bastante es mucho, mi vida. Una cucharada, dos, tres... ¡bastante! Usted va a ver.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 9.0

_Problem: Minor: she uses tú with a learner who switched to usted at the end, and she never has to adapt since the learner never signals confusion, so adaptation is untested._

```
Daniela: ¡Hola, buenas tardes! Bienvenido a la Farmacia San Rafael. Soy Daniela. ¿Cómo te llamas?
Learner: Hola, buenas tardes. Me llamo Jake. Mucho gusto.
Daniela: Mucho gusto, Jake. Qué bueno que vienes. Aquí no hay fila, así que hoy eres el rey. ¿Qué necesitas?
Learner: Hola... Necesito medicina para la dolor de cabeza, por favor.
Daniela: Claro, Jake. Para el dolor de cabeza tengo pastillas. Son pequeñas, pero muy valientes. ¿Es un dolor fuerte?
Learner: Sí, es muy fuerte. Yo tengo el dolor... dos días.
Daniela: Ay, dos días es mucho, Jake. Tu cabeza necesita vacaciones. Voy por las pastillas. ¿Tomas agua hoy?
Learner: Sí, yo tomo agua. Pero no mucho... un poco.
Daniela: Un poco de agua y mucho dolor. Mala combinación, Jake. Aquí está la pastilla. Tómala con un vaso grande de agua.
Learner: Okay, gracias. ¿Cuánto es, por favor?
Daniela: Son cuarenta pesos, Jake. Es barato. Tu cabeza vale más, pero la farmacia no cobra extra.
Learner: Okay, cuarenta pesos. Aquí está... ¿Usted tiene cambio? Tengo un billete de quinientos.
Daniela: Sí, tengo cambio. Pero mi caja va a llorar un poquito. Aquí tienes cuatrocientos sesenta pesos.
```
