# Conversation test

2026-10-17 04:04 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.2 / 10

| Criterion | Average |
|---|---|
| language | 8.6 |
| understands | 9.4 |
| adapts | 7.2 |
| alive | 7.0 |
| regional | 8.8 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 11 |
| Reply (median words) | 15 |
| Reply (average words) | 16.2 |
| Longest reply (words) | 37 |
| Replies over 30 words | 9% |
| Questions per reply | 0.6 |
| Replies asking 2+ questions | 3% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **When the learner is lost, the character explains in more hard Spanish.** Don Arturo answered an English request for help with "Un poquito, sí. Nací quiere decir…" and kept going in Spanish. Doña Chuy glossed "ahorita" with "ya mero".
2. **Characters sound generic, and some details are shaky.** Beto: "San Miguel es muy bonito. Hay muchas calles de piedra." The taquillero Don Arturo: "Mercado de La Acocota o el Mercado El Parián", with no TAPO color and a questionable chiles en nogada claim.
3. **Replies run long for one learner level.** The taquillero Don Arturo with the improving learner had a median of 30 words and 43% of replies over 30. The other four conversations stayed at a median of 13-15 words with none over 30.

## Recommendations

1. **Handle "I'm lost" in `build-turn-prompt.ts`, not with a general simplification rule.** When the learner's last turn contains English or a "what does X mean" pattern, add a one-line note to that turn only: "The learner is lost. Give a short English gloss or one simple Spanish word, then go back to the conversation." Characters stay native-speed the rest of the time. This fixes problem 1 directly.

2. **Give each character a few concrete details in character data.** For each one, add 3-4 specific, checked items: a habit or opinion, a real place or routine, and a pet peeve. For example, Beto might complain about tourists blocking the cobblestone streets, and the taquillero might mention TAPO bus schedules and the Puebla route. Also add a line like "If you aren't sure of a specific fact, talk about your own experience instead." That makes the characters distinct and cuts the invented recommendations.

3. **Low priority: add a light brevity nudge for the long-reply case.** Only one conversation had this problem, so don't touch the character prompt yet. If it shows up again, add a line to the turn prompt such as "Say one thing, then leave room for the learner." Daniela's dosage burst is fine, since the learner never showed confusion, so no change there.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Don Arturo (jubilado) | Zócalo de Oaxaca, Oaxaca | hesitant | 6 | 8 | 5 | 6 | 8 | 6.6 | 11 | 15 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | hesitant | 8 | 9 | 7 | 8 | 10 | 8.4 | 6 | 15 |
| Beto (taxista) | Jardín Allende y sitio de taxis, San Miguel de Allende | english-beginner | 10 | 10 | 8 | 6 | 9 | 8.6 | 5 | 13 |
| Don Arturo (taquillero) | Terminal de Autobuses del Oriente (TAPO), Ciudad de México | improving | 10 | 10 | 8 | 7 | 8 | 8.6 | 11 | 30 |
| Daniela (farmacéutica) | Farmacia San Rafael, Puebla | english-beginner | 9 | 10 | 8 | 8 | 9 | 8.8 | 12 | 15 |


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

### Don Arturo, Zócalo de Oaxaca (Oaxaca) · hesitant · 6.6

_Problem: When the learner asked in English for help, Don Arturo said he speaks a little but then began another Spanish-only explanation instead of giving the English gloss ('born'), and the earlier 'llegué al mundo' explanation was more confusing than the word itself._

```
Don Arturo: ¡Buenas tardes! Qué bonito día para estar en el zócalo, ¿verdad?
Learner: Ehm... buenas tardes. Sí, es... muy bonito.
Don Arturo: ¡Qué bueno! Yo me siento aquí todas las tardes. Me gusta ver la gente pasar.
Learner: Ehm... ¿repite, por favor? Más lento... no entiendo mucho.
Don Arturo: Sí, claro. Me siento aquí. Todas las tardes. Me gusta ver la gente.
Learner: Ah, sí... ehm... usted se sienta aquí todas las tardes. ¡Qué bonito!
Don Arturo: Sí, así es. Aquí veo pasar a todos: turistas, vendedores, niños con sus globos. Y usted, ¿de dónde es?
Learner: Ehm... yo soy de... Estados Unidos. ¿Y usted?
Don Arturo: Ah, de Estados Unidos. Yo soy de aquí, de Oaxaca. Nací en el centro, cerca de este mismo zócalo.
Learner: Ehm... ¿nació... en el centro? Perdón, ¿qué significa "nací"?
Don Arturo: Nací significa que llegué al mundo. Yo nací aquí, en el centro de Oaxaca. Nací hace setenta y tres años.
Learner: Ehm... "llegué al mundo"... no entiendo. Sorry, do you speak English?
Don Arturo: Un poquito, sí. Nací quiere decir 
```

### Beto, Jardín Allende y sitio de taxis (San Miguel de Allende) · english-beginner · 8.6

_Problem: Beto is generic and repetitive (says 'Súbete' twice, 'muy bonito' echoing the learner) and shows little taxi-driver personality or specific local color beyond the enchiladas mineras mention._

```
Beto: ¡Hola! ¿Qué onda? ¿Necesitas taxi?
Learner: Hola. Sí, yo necesito un taxi, por favor. Yo quiero ir a el Mercado de Artesanías.
Beto: ¡Claro que sí! El Mercado de Artesanías está aquí cerca, a cinco minutos. ¿Vamos?
Learner: Sí, vamos. ¿Cuánto cuesta, por favor?
Beto: Son unos cincuenta pesos, más o menos. Es muy poquito. ¡Súbete!
Learner: Okay, gracias. Cincuenta pesos, está bien.
Beto: ¡Perfecto! Súbete, por favor. Ya nos vamos.
Learner: Gracias, señor. ¿Usted es de San Miguel?
Beto: Sí, soy de aquí, de San Miguel. Nací y crecí en el Centro. Conozco todas las calles.
Learner: Ah, qué bien. Yo soy de los Estados Unidos. Me gusta mucho San Miguel.
Beto: ¡Qué bonito! San Miguel es muy bonito. Hay muchas calles de piedra. ¿Te gusta la comida?
Learner: Sí, me gusta la comida mucho. Los tacos son muy bueno.
Beto: ¡Los tacos son buenísimos! ¿Ya probaste las enchiladas mineras? Son muy famosas aquí.
```

### Don Arturo, Terminal de Autobuses del Oriente (TAPO) (Ciudad de México) · improving · 8.6

_Problem: Don Arturo reads like a generic helpful guide rather than a distinct taquillero: no quirks, no TAPO color, and some details are questionable (chiles en nogada are seasonal; Mercado La Acocota is not known for them)._

```
Don Arturo: ¡Buenos días! ¿Va a viajar hoy o solo viene a preguntar?
Learner: Buenos días, señor. Sí, quiero viajar a Puebla hoy, porque ayer visité el centro y me gustó mucho. ¿Hay un autobús en la mañana?
Don Arturo: ¡Qué bien! Puebla es muy bonita, con sus iglesias y sus calles de colores. Sí hay autobuses por la mañana. Salen cada media hora, desde las seis. ¿Quiere ir de ida nada más, o también de regreso?
Learner: Ida y vuelta, por favor, porque regreso mañana. ¿Usted visitó Puebla alguna vez, señor?
Don Arturo: Sí, muchas veces. Mi esposa es de Puebla, así que yo voy cada año. Le recomiendo que pruebe los chiles en nogada, si le gustan los sabores fuertes.
Learner: ¡Qué bonito, su esposa es de Puebla! ¿Qué son los chiles en nogada?
Don Arturo: Son chiles poblanos rellenos de carne, con frutas y nueces. Encima llevan una salsa blanca de nuez, y un poco de granada roja y perejil. Son muy sabrosos, y tienen los colores de la bandera.
Learner: Ah, creo que entiendo, tienen carne y frutas. ¿Son muy picantes, señor?
Don Arturo: No, para nada. El chile poblano es suave, casi no pica. Lo que sí tiene es mucho sabor dulce y un poco salado. Por eso a mucha gente le gusta.
Learner: Ah, qué bueno, no me gusta mucho el picante. ¿Dónde puedo comprar los chiles en nogada en Puebla?
Don Arturo: En Puebla hay muchos lugares. Mi recomendación es el Mercado de La Acocota o el Mercado El Parián, en el centro. Pregunte a la gente de la calle, ellos le dicen dónde comer bien.
Learner: Gracias, señor. ¿Cuánto cuesta el boleto de ida y vuelta, por favor?
Don Arturo: Son trescientos cincuenta pesos, ida y vuelta. ¿A qué hora quiere salir?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · hesitant · 8.4

_Problem: When the learner asked in English-mixed Spanish what "ahorita" meant, she explained with more unfamiliar slang ("ya mero") in Spanish instead of simplifying, so the learner got lost again._

```
Doña Chuy: ¡Ay, buenas! Bienvenido, pásele. ¿Tiene hambre?
Learner: Ehm... sí. Yo... tengo hambre.
Doña Chuy: ¡Qué bueno! Pues siéntese aquí, en esta mesa. Hoy tengo birria y pozole. ¿Cuál quiere?
Learner: Ehm... ¿pozole? Sí... pozole, por favor.
Doña Chuy: ¡Muy bien! Pozole, buena elección. Ahorita se lo traigo, con todo: cebolla, orégano, limón. ¿Quiere agua de jamaica o refresco?
Learner: Ehm... ¿agua de... jamaica? Sí, por favor.
Doña Chuy: ¡Ándale! Agua de jamaica, rojita y bien fría. Ahorita vengo.
Learner: Ehm... gracias. Sorry, ¿"ahorita"... es ahora?
Doña Chuy: Sí, ahorita es ahorita, o sea, ya mero. Quiere decir 'en un momentito'. Aquí todo es ahorita, ¿eh?
Learner: Ehm... ¿"ya mero"? Perdón, no entiendo. Más despacio, por favor.
Doña Chuy: Ya mero: muy pronto. Ahorita, ya mero. ¿Entiende?
Learner: Ehm... sí, entiendo. Muy pronto. Gracias.
Doña Chuy: ¡De nada, mijo! Ya le traigo su pozole. Usted coma despacito, que no se le va a acabar.
```

### Daniela, Farmacia San Rafael (Puebla) · english-beginner · 8.8

_Problem: Daniela gives the dosage instructions in one quick burst without checking that the beginner understood, though the learner never showed confusion._

```
Daniela: ¡Hola! Bienvenido a la Farmacia San Rafael. ¿En qué le puedo ayudar?
Learner: Hola. Yo necesito medicina para el dolor de cabeza, por favor.
Daniela: Claro que sí. ¿Es un dolor fuerte o leve?
Learner: Es fuerte. Mi cabeza duele mucho.
Daniela: Ay, qué feo. ¿Desde cuándo le duele la cabeza?
Learner: Desde... ayer. Yo no duermo bien.
Daniela: Ah, por eso. Sin dormir bien, cualquiera se queda con dolor de cabeza. ¿Tiene fiebre o algo más?
Learner: No fiebre. Solo el dolor de cabeza y yo estoy muy cansado.
Daniela: Entiendo. Sin fiebre, lo más común es un analgésico como el paracetamol. ¿Es alérgico a algún medicamento?
Learner: No, yo no soy alérgico. ¿Cuánto cuesta el paracetamol?
Daniela: Depende de la marca. El genérico cuesta unos 30 pesos, la caja de 10 tabletas.
Learner: Okay, el genérico, por favor. Treinta pesos, ¿sí?
Daniela: Sí, treinta pesos. Aquí tiene. Tome una tableta cada ocho horas, con agua. Y duerma un poco más, si puede.
```
